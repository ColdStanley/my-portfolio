export default function TutoringPage() {
  return (
    <main className="min-h-screen bg-white pt-24 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">My Tutoring Experience</h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          As a dedicated Python and Excel tutor, I specialize in helping beginners build confidence in tech.
          I’ve guided students from basic data types all the way to practical project development, ensuring they grasp
          not only the how, but also the why.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          I create structured, interactive, and real-world-oriented lesson plans—whether it’s solving business problems
          using Excel functions like <code className="bg-gray-100 px-1 py-0.5 rounded">XLOOKUP</code> and
          <code className="bg-gray-100 px-1 py-0.5 rounded">Solver</code>, or writing your first
          <code className="bg-gray-100 px-1 py-0.5 rounded">for loop</code> in Python.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          Teaching isn’t just about delivering content. I take pride in helping students develop their problem-solving mindset,
          and seeing their confidence grow as they learn.
        </p>
      </div>
    </main>
  );
}
