const projects = [
  {
    title: "Genotion",
    description: "An AI-powered tool that generates content using Gemini and writes to Notion via API.",
    tech: ["Python", "Streamlit", "Notion API"],
    link: "#"
  },
  {
    title: "Bilibili Video Series",
    description: "A series of videos focused on language learning and cultural commentary, reaching 500k+ views.",
    tech: ["Video Editing", "Mandarin", "Social Media"],
    link: "#"
  },
  {
    title: "Excel Tutor Toolkit",
    description: "An Excel teaching system using real-world examples and interactive problem-solving techniques.",
    tech: ["Excel", "XLOOKUP", "Solver"],
    link: "#"
  }
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 pt-32">
      <h1 className="text-4xl font-bold text-center text-purple-700 mb-12">My Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 fade-in hover-card">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">{project.title}</h2>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech.map((tech, i) => (
                <span
                  key={i}
                  className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
            <a
              href={project.link}
              className="text-sm text-blue-600 hover:underline"
            >
              View Project →
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
