'use client';

import Link from "next/link";
import Navbar from "../components/Navbar";
const blogPosts = [
	{
		title: "LLMs vs. SLMs: What's the Difference, and Why Does It Matter?",
		date: "September 21, 2025",
		image: "/blog/llms-vs-slms.png",
		excerpt: "A deep dive into the differences between LLMs and SLMs, and why it matters for your business.",
		tags: ["AI", "Industry"],
		href: "/blog/llms-vs-slms",
	},
	{
		title: "Build and Test AI Applications with Langflow + Ollama on Vast.ai",
		date: "September 18, 2025",
		image: "/blog/langflow-ollama.png",
		excerpt: "How to quickly build and test AI apps using Langflow and Ollama on Vast.ai.",
		tags: ["AI", "GPU"],
		href: "/blog/langflow-ollama",
	},
	// ...add more posts as needed
];

export default function BlogPage() {
	return (
        <>
        <main className="min-h-screen bg-white text-gray-900 py-20 px-4">
        <Navbar />
			<div className="max-w-5xl mx-auto">
				<h1 className="text-4xl font-bold mb-8 text-left">Blog</h1>
				<div className="flex flex-wrap gap-3 mb-8">
					<button className="bg-[#20b2aa] text-white px-4 py-2 rounded-full font-semibold shadow">
						All Posts
					</button>
					<button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold shadow">
						GPU
					</button>
					<button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold shadow">
						Industry
					</button>
					<button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold shadow">
						NVIDIA
					</button>
					<button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold shadow">
						AI
					</button>
				</div>
				<div className="grid md:grid-cols-2 gap-8">
					{blogPosts.map((post, i) => (
						<Link
							href={post.href}
							key={post.title}
							className={`group flex flex-col md:flex-row items-stretch bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 fade-in-milky`}
							style={{ animationDelay: `${i * 120}ms` }}
						>
							<div className="md:w-1/3 w-full h-48 md:h-auto bg-gray-100 flex items-center justify-center overflow-hidden">
								<img
									src={post.image}
									alt={post.title}
									className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
								/>
							</div>
							<div className="flex-1 p-6 flex flex-col justify-between">
								<div>
									<h2 className="text-2xl font-bold mb-2 group-hover:text-[#20b2aa] transition-colors">
										{post.title}
									</h2>
									<div className="text-gray-500 text-sm mb-2">
										{post.date}
									</div>
									<p className="text-gray-700 mb-4">{post.excerpt}</p>
									<div className="flex gap-2 flex-wrap">
										{post.tags.map((tag) => (
											<span
												key={tag}
												className="bg-[#20b2aa]/10 text-[#20b2aa] px-3 py-1 rounded-full text-xs font-semibold"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
			<style jsx>{`
				.fade-in-milky {
					opacity: 0;
					transform: translateY(30px) scale(0.98);
					animation: milkyFadeIn 0.8s cubic-bezier(0.4, 0.2, 0.2, 1) forwards;
				}
				@keyframes milkyFadeIn {
					to {
						opacity: 1;
						transform: translateY(0) scale(1);
						box-shadow: 0 8px 32px 0 rgba(32, 178, 170, 0.1),
							0 1.5px 6px 0 rgba(32, 178, 170, 0.08);
						background: linear-gradient(120deg, #fff 80%, #e0f7fa 100%);
					}
				}
			`}</style>
		</main>
        </>
		
	);
}
