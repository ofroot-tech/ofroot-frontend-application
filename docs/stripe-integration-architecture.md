# Stripe Integration — Architecture & Implementation

**Purpose:** Checkout, webhooks, and payment management for invoices and quotes  
**Timeline:** 2 weeks (Sprint 6-7)  
**Dependencies:** Invoice system, Quote system

---

## 1. Stripe Account Setup

### Required Stripe Products
- ✅ Checkout Sessions (for invoice/quote payments)
- ✅ Webhooks (payment status updates)
- ✅ Payment Intents (for refunds, disputes)
- ✅ Customer Portal (for customer self-service)

### Environment Variables

```env
# .env.local (Frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend (Laravel)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_API_VERSION=2024-11-20.acacia
```

---

## 2. Database Schema Updates

### Payments Table (Existing - Enhancements)

```sql
-- Add to existing payments table
ALTER TABLE payments ADD COLUMN stripe_session_id VARCHAR(255) NULL;
ALTER TABLE payments ADD COLUMN stripe_charge_id VARCHAR(255) NULL;
ALTER TABLE payments ADD COLUMN stripe_refund_id VARCHAR(255) NULL;
ALTER TABLE payments ADD COLUMN payment_method_type VARCHAR(50) NULL; -- 'card', 'ach', etc.
ALTER TABLE payments ADD COLUMN payment_method_last4 VARCHAR(4) NULL;
ALTER TABLE payments ADD COLUMN payment_method_brand VARCHAR(50) NULL; -- 'visa', 'mastercard'
ALTER TABLE payments ADD COLUMN stripe_fee_cents INT NULL;
ALTER TABLE payments ADD COLUMN net_amount_cents INT NULL;
ALTER TABLE payments ADD COLUMN refunded_at TIMESTAMP NULL;
ALTER TABLE payments ADD COLUMN refund_reason TEXT NULL;

CREATE INDEX idx_stripe_session ON payments(stripe_session_id);
CREATE INDEX idx_stripe_charge ON payments(stripe_charge_id);
```

### Stripe Webhooks Log Table

```sql
CREATE TABLE stripe_webhooks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSON NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP NULL,
  error_message TEXT NULL,
  attempts INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_event_type (event_type),
  INDEX idx_processed (processed),
  INDEX idx_stripe_event_id (stripe_event_id)
);
```

### Customer Stripe Mapping Table

```sql
CREATE TABLE customer_stripe_mappings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT UNSIGNED NOT NULL,
  contact_id BIGINT UNSIGNED NOT NULL,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  
  INDEX idx_contact_id (contact_id),
  INDEX idx_stripe_customer (stripe_customer_id)
);
```

---

## 3. TypeScript Types

```typescript
// Add to app/lib/api.ts

export type StripeCheckoutSession = {
  id: string;
  url: string;
  expires_at: number;
};

export type PaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 
          'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  payment_method_types: string[];
};

export type RefundInput = {
  payment_id: number;
  amount_cents?: number; // Partial refund if less than original
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  notes?: string;
};

export type StripeWebhookEvent = {
  id: number;
  stripe_event_id: string;
  event_type: string;
  payload: Record<string, any>;
  processed: boolean;
  processed_at?: string | null;
  error_message?: string | null;
  attempts: number;
  created_at?: string;
};

// Update existing Payment type
export type Payment = {
  id: number;
  invoice_id: number;
  amount_cents: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  provider?: string | null;
  provider_payment_id?: string | null;
  
  // Stripe fields
  stripe_session_id?: string | null;
  stripe_charge_id?: string | null;
  stripe_refund_id?: string | null;
  payment_method_type?: string | null;
  payment_method_last4?: string | null;
  payment_method_brand?: string | null;
  stripe_fee_cents?: number | null;
  net_amount_cents?: number | null;
  refunded_at?: string | null;
  refund_reason?: string | null;
  
  created_at?: string;
  updated_at?: string;
};
```

---

## 4. API Methods

```typescript
// Add to app/lib/api.ts exports

export const api = {
  // ... existing methods ...
  
  // ===== STRIPE PAYMENTS =====
  
  // Create checkout session for invoice
  createInvoiceCheckoutSession(
    token: string,
    invoiceId: number,
    options?: {
      success_url?: string;
      cancel_url?: string;
    }
  ) {
    return http.postJson<{ data: StripeCheckoutSession }>(
      `/admin/invoices/${invoiceId}/checkout`,
      options || {},
      { token }
    );
  },
  
  // Create checkout session for quote
  createQuoteCheckoutSession(
    token: string,
    quoteId: number,
    options?: {
      success_url?: string;
      cancel_url?: string;
      create_job?: boolean;
    }
  ) {
    return http.postJson<{ data: StripeCheckoutSession }>(
      `/admin/quotes/${quoteId}/checkout`,
      options || {},
      { token }
    );
  },
  
  // Public: Create checkout session by external ID
  createPublicInvoiceCheckout(externalId: string) {
    return http.postJson<{ data: StripeCheckoutSession }>(
      `/invoices/${externalId}/checkout`,
      {}
    );
  },
  
  createPublicQuoteCheckout(externalId: string) {
    return http.postJson<{ data: StripeCheckoutSession }>(
      `/quotes/${externalId}/checkout`,
      {}
    );
  },
  
  // Refund payment
  adminRefundPayment(token: string, input: RefundInput) {
    return http.postJson<{ data: Payment; message: string }>(
      `/admin/payments/${input.payment_id}/refund`,
      input,
      { token }
    );
  },
  
  // Get payment details
  adminGetPayment(token: string, id: number) {
    return http.get<{ data: Payment }>(`/admin/payments/${id}`, { token });
  },
  
  // List all payments
  adminListPayments(
    token: string,
    filters?: {
      page?: number;
      per_page?: number;
      status?: Payment['status'];
      invoice_id?: number;
      from_date?: string;
      to_date?: string;
    }
  ) {
    const params = new URLSearchParams();
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.per_page) params.set('per_page', String(filters.per_page));
    if (filters?.status) params.set('status', filters.status);
    if (filters?.invoice_id) params.set('invoice_id', String(filters.invoice_id));
    if (filters?.from_date) params.set('from_date', filters.from_date);
    if (filters?.to_date) params.set('to_date', filters.to_date);
    
    const path = `/admin/payments${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<Paginated<Payment>>(path, { token });
  },
  
  // List webhook events (for debugging)
  adminListStripeWebhooks(
    token: string,
    filters?: {
      page?: number;
      per_page?: number;
      event_type?: string;
      processed?: boolean;
    }
  ) {
    const params = new URLSearchParams();
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.per_page) params.set('per_page', String(filters.per_page));
    if (filters?.event_type) params.set('event_type', filters.event_type);
    if (filters?.processed !== undefined) params.set('processed', String(filters.processed));
    
    const path = `/admin/stripe/webhooks${params.toString() ? `?${params.toString()}` : ''}`;
    return http.get<Paginated<StripeWebhookEvent>>(path, { token });
  },
  
  // Retry failed webhook
  adminRetryStripeWebhook(token: string, id: number) {
    return http.postJson<{ data: StripeWebhookEvent; message: string }>(
      `/admin/stripe/webhooks/${id}/retry`,
      {},
      { token }
    );
  },
};
```

---

## 5. Laravel Backend Routes

```php
// routes/api.php

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('admin')->group(function () {
        
        // Stripe Checkout
        Route::post('/invoices/{invoice}/checkout', [StripeController::class, 'createInvoiceCheckout']);
        Route::post('/quotes/{quote}/checkout', [StripeController::class, 'createQuoteCheckout']);
        
        // Payments
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::get('/payments/{payment}', [PaymentController::class, 'show']);
        Route::post('/payments/{payment}/refund', [PaymentController::class, 'refund']);
        
        // Webhook management
        Route::get('/stripe/webhooks', [StripeWebhookController::class, 'index']);
        Route::post('/stripe/webhooks/{webhook}/retry', [StripeWebhookController::class, 'retry']);
    });
});

// Public routes
Route::post('/invoices/{externalId}/checkout', [PublicStripeController::class, 'createInvoiceCheckout']);
Route::post('/quotes/{externalId}/checkout', [PublicStripeController::class, 'createQuoteCheckout']);

// Webhook endpoint (no auth)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);
```

---

## 6. Stripe Webhook Events to Handle

### Critical Events

```typescript
const WEBHOOK_EVENTS = {
  // Payment succeeded
  'checkout.session.completed': handleCheckoutCompleted,
  
  // Payment intents
  'payment_intent.succeeded': handlePaymentSucceeded,
  'payment_intent.payment_failed': handlePaymentFailed,
  
  // Refunds
  'charge.refunded': handleChargeRefunded,
  
  // Disputes
  'charge.dispute.created': handleDisputeCreated,
  'charge.dispute.closed': handleDisputeClosed,
  
  // Customer updates
  'customer.updated': handleCustomerUpdated,
};
```

### Webhook Handler Logic

```php
// Laravel webhook handler pseudocode

public function handle(Request $request) {
    $payload = $request->getContent();
    $sig = $request->header('Stripe-Signature');
    
    try {
        $event = \Stripe\Webhook::constructEvent(
            $payload, 
            $sig, 
            config('services.stripe.webhook_secret')
        );
    } catch (\Exception $e) {
        return response()->json(['error' => 'Invalid signature'], 400);
    }
    
    // Log webhook
    StripeWebhook::create([
        'stripe_event_id' => $event->id,
        'event_type' => $event->type,
        'payload' => $event->data->toArray(),
    ]);
    
    // Process event
    switch ($event->type) {
        case 'checkout.session.completed':
            $this->handleCheckoutCompleted($event->data->object);
            break;
        case 'payment_intent.succeeded':
            $this->handlePaymentSucceeded($event->data->object);
            break;
        // ... other cases
    }
    
    return response()->json(['received' => true]);
}

private function handleCheckoutCompleted($session) {
    $invoiceId = $session->metadata->invoice_id ?? null;
    $quoteId = $session->metadata->quote_id ?? null;
    
    if ($invoiceId) {
        $invoice = Invoice::find($invoiceId);
        
        // Create payment record
        Payment::create([
            'invoice_id' => $invoice->id,
            'amount_cents' => $session->amount_total,
            'currency' => strtoupper($session->currency),
            'status' => 'succeeded',
            'provider' => 'stripe',
            'stripe_session_id' => $session->id,
            'stripe_charge_id' => $session->payment_intent,
            'payment_method_type' => $session->payment_method_types[0] ?? null,
        ]);
        
        // Update invoice
        $invoice->update([
            'amount_paid_cents' => $invoice->amount_paid_cents + $session->amount_total,
            'status' => $invoice->amount_paid_cents >= $invoice->amount_cents ? 'paid' : 'sent',
        ]);
        
        // Send receipt email
        Mail::to($session->customer_email)->send(new PaymentReceiptMail($invoice));
    }
    
    if ($quoteId) {
        $quote = Quote::find($quoteId);
        $quote->update(['status' => 'approved', 'approved_at' => now()]);
        
        // Auto-create job if configured
        if ($session->metadata->create_job === 'true') {
            $this->convertQuoteToJob($quote);
        }
    }
}
```

---

## 7. Frontend Payment Flow

### Invoice Payment Page Enhancement

```tsx
// app/invoice/[externalId]/pay/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';

export default function InvoicePaymentPage({ params }: { params: { externalId: string } }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  async function handlePayNow() {
    setLoading(true);
    
    try {
      const res = await api.createPublicInvoiceCheckout(params.externalId);
      
      // Redirect to Stripe Checkout
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Unable to create checkout session. Please try again.');
      setLoading(false);
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pay Invoice</h1>
      
      {/* Invoice details display */}
      
      <button
        onClick={handlePayNow}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating checkout...' : 'Pay with Card'}
      </button>
      
      <div className="mt-4 text-center text-sm text-gray-600">
        <svg className="inline w-4 h-4 mr-1" /* Stripe logo */></svg>
        Secure payment powered by Stripe
      </div>
    </div>
  );
}
```

### Success/Cancel Pages

```tsx
// app/invoice/[externalId]/pay/success/page.tsx

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="mb-4">
        <svg className="w-16 h-16 mx-auto text-green-600" /* Checkmark icon */></svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-gray-600 mb-6">
        Your payment has been processed. You'll receive a receipt via email shortly.
      </p>
      <a href="/" className="text-blue-600 hover:underline">
        Return to homepage
      </a>
    </div>
  );
}
```

---

## 8. Dashboard Payment Management UI

### Payment List Page

```
app/dashboard/payments/
  ├── page.tsx                    # All payments list
  ├── [id]/
  │   └── page.tsx               # Payment detail + refund UI
  └── _components/
      ├── PaymentCard.tsx        # List item
      ├── RefundModal.tsx        # Refund form
      └── PaymentFilters.tsx     # Filter controls
```

### Refund Modal Component

```tsx
// app/dashboard/payments/_components/RefundModal.tsx

type Props = {
  payment: Payment;
  onSuccess: () => void;
  onClose: () => void;
};

export function RefundModal({ payment, onSuccess, onClose }: Props) {
  const [amount, setAmount] = useState(payment.amount_cents);
  const [reason, setReason] = useState<RefundInput['reason']>('requested_by_customer');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.adminRefundPayment(token, {
        payment_id: payment.id,
        amount_cents: amount,
        reason,
        notes,
      });
      
      onSuccess();
    } catch (err) {
      alert('Refund failed');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h2>Refund Payment</h2>
        
        <label>
          Refund Amount
          <input
            type="number"
            value={amount / 100}
            onChange={(e) => setAmount(Math.round(parseFloat(e.target.value) * 100))}
            max={payment.amount_cents / 100}
          />
        </label>
        
        <label>
          Reason
          <select value={reason} onChange={(e) => setReason(e.target.value as any)}>
            <option value="requested_by_customer">Customer Request</option>
            <option value="duplicate">Duplicate Payment</option>
            <option value="fraudulent">Fraudulent</option>
          </select>
        </label>
        
        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : `Refund $${(amount / 100).toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
```

---

## 9. Implementation Phases

### Week 1: Checkout Integration
- [ ] Add Stripe SDK to backend
- [ ] Create checkout session endpoints
- [ ] Update payment schema with Stripe fields
- [ ] Build invoice payment flow UI
- [ ] Build quote payment flow UI
- [ ] Test successful payments
- [ ] Add success/cancel redirect pages

### Week 2: Webhooks + Refunds
- [ ] Create webhook handler endpoint
- [ ] Build webhook log table + processing
- [ ] Implement critical webhook events
- [ ] Build payment detail page in dashboard
- [ ] Add refund UI and processing
- [ ] Test webhook delivery
- [ ] Add webhook retry mechanism
- [ ] Document Stripe setup guide

---

## 10. Testing Checklist

- [ ] Test card: 4242 4242 4242 4242 (succeeds)
- [ ] Test card: 4000 0000 0000 0002 (fails)
- [ ] Partial refund processes correctly
- [ ] Full refund updates invoice status
- [ ] Webhook signature validation works
- [ ] Duplicate webhook events are idempotent
- [ ] Payment receipt emails send
- [ ] Stripe fee calculation is accurate

---

## 11. Security & Compliance

### PCI Compliance
- ✅ Never store card numbers (Stripe handles)
- ✅ Use Stripe Checkout (hosted page)
- ✅ Webhook signature verification
- ✅ HTTPS only for all payment pages

### Data Privacy
- Log minimal payment data
- Redact sensitive info in logs
- Store only last4 + brand for display

---

## 12. Stripe Dashboard Configuration

**Webhook URL:** `https://yourdomain.com/api/stripe/webhook`

**Events to Subscribe:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`

**Test Mode Settings:**
- Enable "View test data" toggle
- Use test API keys (pk_test_*, sk_test_*)

---

## 13. Success Metrics

- [ ] Checkout session creation < 500ms
- [ ] Webhook processing < 2s
- [ ] Payment success rate > 95%
- [ ] Refund processing < 5s
- [ ] Zero duplicate charges
- [ ] Receipt email delivery > 98%

---

**Next Steps:** Set up Stripe account → Create webhook endpoint → Test payment flow.
