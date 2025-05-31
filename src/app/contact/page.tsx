export default function ContactPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="text-center animate-fadeInUp">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">Contact Me</h1>
        <p className="text-lg text-gray-700 mb-6">
          I’d love to hear from you! Whether you have a question, opportunity, or just want to say hi.
        </p>
        <p className="mb-2">📧 Email: <a href="mailto:stanley@example.com" className="text-blue-600 hover:underline">stanley@example.com</a></p>
        <p className="mb-2">🔗 Bilibili: <a href="#" className="text-blue-600 hover:underline">Visit my channel</a></p>
        <p>🐍 Python Tutor Profile: <a href="#" className="text-blue-600 hover:underline">Link to tutoring platform</a></p>
      </div>
    </main>
  )
}
