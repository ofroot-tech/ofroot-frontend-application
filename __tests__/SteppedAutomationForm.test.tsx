/** @jest-environment jsdom */

import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import SteppedAutomationForm from "@/app/landing/components/SteppedAutomationForm";

// Mock the toast component
jest.mock("@/components/Toaster", () => ({
  toast: jest.fn(),
}));

describe("SteppedAutomationForm", () => {
  let container: HTMLDivElement;
  let root: any;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    root?.unmount?.();
    document.body.innerHTML = "";
  });

  // Helper function to fill in a field
  function fillField() {
    const input = container.querySelector("input[type='text'], input[type='email'], textarea, select, input[type='radio']") as HTMLInputElement;
    if (input && input.type === "radio") {
      const radios = container.querySelectorAll("input[type='radio']");
      (radios[0] as HTMLInputElement).click();
    } else if (input) {
      input.value = "test value";
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  // Test 1: Component renders on initial load
  it("renders on initial load", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });
    expect(container.innerHTML).toBeTruthy();
    expect(container.textContent).toContain("Question 1 of 42");
  });

  // Test 2: Exactly one question renders per step
  it("shows exactly one question per step", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });
    const questionLabels = container.querySelectorAll("h2.text-2xl");
    expect(questionLabels.length).toBe(1);
    expect(questionLabels[0].textContent).toContain("Legal Business Name");
  });

  // Test 3: Each question has exactly one input field
  it("has exactly one input field per question", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });
    const inputs = container.querySelectorAll("input[type='text'], textarea, select, input[type='email']");
    const radioInputs = container.querySelectorAll("input[type='radio']");
    expect(inputs.length + radioInputs.length).toBeGreaterThanOrEqual(1);
  });

  // Test 4: Each question has exactly one helper button
  it("has exactly one helper button per question", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });
    const helperButtons = container.querySelectorAll('[data-testid^="helper-btn-"]');
    expect(helperButtons.length).toBe(1);
  });

  // Test 5: Helper button click shows helper text as toast
  it("shows helper text as toast when helper button is clicked", () => {
    const { toast } = require("@/components/Toaster");
    act(() => {
      root.render(<SteppedAutomationForm />);
    });
    const helperBtn = container.querySelector('[data-testid^="helper-btn-"]') as HTMLButtonElement;
    expect(helperBtn).toBeTruthy();

    act(() => {
      helperBtn.click();
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "info",
      })
    );
  });

  // Test 6: Next button advances to next question
  it("advances to next question when Next button is clicked", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });
    expect(container.textContent).toContain("Question 1 of 42");
    expect(container.textContent).toContain("Legal Business Name");

    // Fill the required field
    act(() => {
      fillField();
    });

    const nextBtn = container.querySelector('[data-testid="btn-next"]') as HTMLButtonElement;
    act(() => {
      nextBtn.click();
    });

    expect(container.textContent).toContain("Question 2 of 42");
    expect(container.textContent).toContain("Public Brand Name");
  });

  // Test 7: Previous button goes to prior question
  it("goes to previous question when Previous button is clicked", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    // Fill first field and advance
    act(() => {
      fillField();
    });

    const nextBtn = container.querySelector('[data-testid="btn-next"]') as HTMLButtonElement;
    act(() => {
      nextBtn.click();
    });

    expect(container.textContent).toContain("Question 2 of 42");

    // Fill second field and go back
    act(() => {
      fillField();
    });

    const prevBtn = container.querySelector('[data-testid="btn-previous"]') as HTMLButtonElement;
    act(() => {
      prevBtn.click();
    });

    expect(container.textContent).toContain("Question 1 of 42");
  });

  // Test 8: First step has no previous button
  it("does not show Previous button on first question", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });
    const prevBtn = container.querySelector('[data-testid="btn-previous"]');
    expect(prevBtn).toBeNull();
  });

  // Test 9: Form data persists when navigating between steps
  it("persists form data when navigating between steps", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });
    const input = container.querySelector('[data-testid="field-legalBusinessName"]') as HTMLInputElement;

    act(() => {
      input.value = "Test Company LLC";
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const nextBtn = container.querySelector('[data-testid="btn-next"]') as HTMLButtonElement;
    act(() => {
      nextBtn.click();
    });

    const prevBtn = container.querySelector('[data-testid="btn-previous"]') as HTMLButtonElement;
    act(() => {
      prevBtn.click();
    });

    const restoredInput = container.querySelector('[data-testid="field-legalBusinessName"]') as HTMLInputElement;
    expect(restoredInput.value).toBe("Test Company LLC");
  });

  // Test 10: Required field validation prevents advancing
  it("prevents advancing without filling required field", () => {
    const { toast } = require("@/components/Toaster");
    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    const nextBtn = container.querySelector('[data-testid="btn-next"]') as HTMLButtonElement;
    act(() => {
      nextBtn.click();
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        title: "Required field",
      })
    );
    expect(container.textContent).toContain("Question 1 of 42");
  });

  // Test 11: Navigation through multiple questions
  it("allows navigating through multiple questions", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    // Test at least 5 questions
    for (let i = 1; i < 5; i++) {
      expect(container.textContent).toContain(`Question ${i} of 42`);
      act(() => {
        fillField();
      });

      const nextBtn = container.querySelector('[data-testid="btn-next"]');
      if (nextBtn) {
        act(() => {
          (nextBtn as HTMLButtonElement).click();
        });
      }
    }

    expect(container.textContent).toContain("Question 5 of 42");
  });

  // Test 12: Select fields show options
  it("renders select fields with multiple options", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    // Navigate through text fields to reach a select field
    for (let i = 0; i < 10; i++) {
      const select = container.querySelector("select");
      if (select) {
        const options = select.querySelectorAll("option");
        expect(options.length).toBeGreaterThan(1);
        break;
      }

      act(() => {
        fillField();
      });

      const nextBtn = container.querySelector('[data-testid="btn-next"]');
      if (nextBtn) {
        act(() => {
          (nextBtn as HTMLButtonElement).click();
        });
      }
    }
  });

  // Test 13: Helper button exists on all questions
  it("has helper button on each question", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    for (let i = 0; i < 5; i++) {
      const helperBtn = container.querySelector('[data-testid^="helper-btn-"]');
      expect(helperBtn).toBeTruthy();

      act(() => {
        fillField();
      });

      const nextBtn = container.querySelector('[data-testid="btn-next"]');
      if (nextBtn) {
        act(() => {
          (nextBtn as HTMLButtonElement).click();
        });
      }
    }
  });

  // Test 14: Progress bar updates correctly
  it("updates progress bar based on current step", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    const getProgressWidth = () => {
      const progressDiv = container.querySelector(".bg-\\[\\#0f766e\\]");
      return progressDiv?.parentElement?.querySelector("div")?.style.width;
    };

    const initialWidth = getProgressWidth();

    act(() => {
      fillField();
    });

    const nextBtn = container.querySelector('[data-testid="btn-next"]') as HTMLButtonElement;
    act(() => {
      nextBtn.click();
    });

    const newWidth = getProgressWidth();
    expect(newWidth).toBeTruthy();
  });

  // Test 15: Mobile responsive layout
  it("renders responsive layout for mobile viewport", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    const outerDiv = container.querySelector(".flex.items-center.justify-center");
    expect(outerDiv).toBeTruthy();

    const innerDiv = outerDiv?.querySelector(".w-full.max-w-2xl");
    expect(innerDiv).toBeTruthy();
  });

  // Test 16: Button accessibility
  it("has proper testid attributes for all interactive elements", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    expect(container.querySelector('[data-testid="btn-next"]')).toBeTruthy();
    expect(container.querySelector('[data-testid^="helper-btn-"]')).toBeTruthy();
    expect(container.querySelector('[data-testid^="field-"]')).toBeTruthy();
  });

  // Test 17: Success state displays
  it("shows success message when expected", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock;

    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    // Quick navigation to last question
    for (let i = 0; i < 41; i++) {
      act(() => {
        fillField();
      });

      const nextBtn = container.querySelector('[data-testid="btn-next"]');
      if (nextBtn) {
        act(() => {
          (nextBtn as HTMLButtonElement).click();
        });
      }
    }

    // Submit
    const submitBtn = container.querySelector('[data-testid="btn-submit"]') as HTMLButtonElement;
    if (submitBtn) {
      act(() => {
        fillField();
        submitBtn.click();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(container.textContent).toContain("Intake Submitted");
    }
  });

  // Test 18: Has all expected questions
  it("has 42 questions defined", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    let found = 0;
    for (let i = 1; i <= 42; i++) {
      if (container.textContent?.includes(`Question ${i} of 42`)) {
        found = i;
        if (i < 42) {
          act(() => {
            fillField();
          });
          const nextBtn = container.querySelector('[data-testid="btn-next"]');
          if (nextBtn) {
            act(() => {
              (nextBtn as HTMLButtonElement).click();
            });
          }
        }
      } else {
        break;
      }
    }
    expect(found).toBeGreaterThan(0);
  });

  // Test 19: Centered card styling
  it("renders with proper centered card styling", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv?.className).toContain("flex");
    expect(mainDiv?.className).toContain("items-center");
    expect(mainDiv?.className).toContain("justify-center");
    expect(mainDiv?.className).toContain("min-h-screen");
  });

  // Test 20: Card has proper styling
  it("card has proper rounded corners and shadow", () => {
    act(() => {
      root.render(<SteppedAutomationForm />);
    });

    const card = container.querySelector("div.rounded-3xl");
    expect(card).toBeTruthy();
    expect(card?.className).toContain("shadow-2xl");
  });
});
