export default function AboutPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center fade-in">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">About Me</h1>
        <p className="text-lg text-gray-700 mb-2">
          Hi, I’m Stanley! I create digital content, analyze data with Python and SQL, and help others learn tech skills.
        </p>
        <p className="text-md text-gray-600">
          This site is a showcase of my portfolio and personal journey. I enjoy working on creative projects and solving real-world problems through technology.
        </p>
      </div>
    </main>
  );
}
