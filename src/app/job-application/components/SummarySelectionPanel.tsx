'use client'

import { useJobAppInputStore } from '../store/useJobAppInputStore'
import { useJobAppStore } from '../store/useJobAppStore'
import { toast } from 'sonner'

export default function SummarySelectionPanel() {
  const { workExperience, projects, skills, education, awards } = useJobAppInputStore()
  const {
    selectedWorkIndices,
    setSelectedWorkIndices,
    selectedProjectIndices,
    setSelectedProjectIndices,
    selectedSkillIndices,
    setSelectedSkillIndices,
    selectedEducationIndices,
    setSelectedEducationIndices,
    selectedAwardIndices,
    setSelectedAwardIndices,
  } = useJobAppStore()

  const toggleIndex = (index: number, selected: number[], setSelected: (v: number[]) => void) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index))
    } else {
      setSelected([...selected, index])
    }
  }

  const allEmpty =
    workExperience.length === 0 &&
    projects.length === 0 &&
    skills.length === 0 &&
    education.length === 0 &&
    awards.length === 0

  const handleConfirm = () => {
    toast.success(
      '✅ 已确认内容，请继续：1）粘贴 JD；2）匹配分析；3）生成定制化简历和求职信。'
    )
  }

  return (
    <section className="space-y-10">
      <h2 className="text-xl font-bold text-gray-800">✅ Select Content for Generation</h2>

      {allEmpty && (
        <p className="text-sm text-gray-400 italic mt-4">
          No available content yet. Please fill in your information under
          “🛠 Experience / Projects / Skills” on the left before selecting.
        </p>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">💼 Work Experience</h3>
          <ul className="space-y-2">
            {workExperience.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedWorkIndices.includes(index)}
                  onChange={() => toggleIndex(index, selectedWorkIndices, setSelectedWorkIndices)}
                />
                <span className="text-sm text-gray-800">
                  {item.company} - {item.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">📁 Projects</h3>
          <ul className="space-y-2">
            {projects.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedProjectIndices.includes(index)}
                  onChange={() =>
                    toggleIndex(index, selectedProjectIndices, setSelectedProjectIndices)
                  }
                />
                <span className="text-sm text-gray-800">
                  {item.title} ({item.duration})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">🛠 Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => {
              const selected = selectedSkillIndices.includes(index)
              return (
                <button
                  key={index}
                  onClick={() =>
                    toggleIndex(index, selectedSkillIndices, setSelectedSkillIndices)
                  }
                  className={`px-3 py-1 text-sm rounded-full border transition ${
                    selected
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50'
                  }`}
                >
                  {skill}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">🎓 Education</h3>
          <ul className="space-y-2">
            {education.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedEducationIndices.includes(index)}
                  onChange={() =>
                    toggleIndex(index, selectedEducationIndices, setSelectedEducationIndices)
                  }
                />
                <span className="text-sm text-gray-800">
                  {item.school} - {item.degree}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">🏅 Awards & Certificates</h3>
          <ul className="space-y-2">
            {awards.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedAwardIndices.includes(index)}
                  onChange={() =>
                    toggleIndex(index, selectedAwardIndices, setSelectedAwardIndices)
                  }
                />
                <span className="text-sm text-gray-800">
                  {item.title} ({item.source})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirm Button */}
      <div className="pt-6 pb-12">
        <button
          onClick={handleConfirm}
          className="w-48 px-4 py-2 rounded bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
        >
          💾 Confirm Selection
        </button>
      </div>
    </section>
  )
}
