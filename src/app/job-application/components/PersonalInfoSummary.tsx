'use client'

import { useJobAppInputStore } from '../store/useJobAppInputStore'

export default function PersonalInfoSummary() {
  const {
    basic,
    education,
    workExperience,
    projects,
    awards,
    skills,
  } = useJobAppInputStore()

  return (
    <div className="max-w-3xl space-y-12">
      {/* 基本信息 */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-2">🧾 基本信息</h2>
        <ul className="text-gray-700 space-y-1">
          <li><strong>姓名：</strong>{basic.name}</li>
          <li><strong>邮箱：</strong>{basic.email}</li>
          <li><strong>所在地：</strong>{basic.location}</li>
          <li><strong>LinkedIn：</strong>{basic.linkedin}</li>
          <li><strong>作品集：</strong>{basic.portfolio}</li>
        </ul>
      </section>

      {/* 教育经历 */}
      {education.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">🎓 教育经历</h2>
          {education.map((edu, index) => (
            <div key={index} className="mb-4 border-l-4 border-purple-300 pl-4">
              <div><strong>学校：</strong>{edu.school}</div>
              <div><strong>学位：</strong>{edu.degree}</div>
              <div><strong>专业：</strong>{edu.major}</div>
              <div><strong>时间：</strong>{edu.duration}</div>
              <div><strong>描述：</strong>{edu.description}</div>
            </div>
          ))}
        </section>
      )}

      {/* 工作经历 */}
      {workExperience.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">💼 工作经历</h2>
          {workExperience.map((job, index) => (
            <div key={index} className="mb-4 border-l-4 border-purple-300 pl-4">
              <div><strong>公司：</strong>{job.company}</div>
              <div><strong>职位：</strong>{job.title}</div>
              <div><strong>时间：</strong>{job.duration}</div>
              <div><strong>职责：</strong>{job.responsibilities}</div>
              <div><strong>成果：</strong>{job.achievements}</div>
            </div>
          ))}
        </section>
      )}

      {/* 项目 */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">📁 项目经历</h2>
          {projects.map((proj, index) => (
            <div key={index} className="mb-4 border-l-4 border-purple-300 pl-4">
              <div><strong>名称：</strong>{proj.title}</div>
              <div><strong>时间：</strong>{proj.duration}</div>
              <div><strong>描述：</strong>{proj.description}</div>
            </div>
          ))}
        </section>
      )}

      {/* 奖项与证书 */}
      {awards.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">🎖 奖项 / 证书</h2>
          {awards.map((award, index) => (
            <div key={index} className="mb-4 border-l-4 border-purple-300 pl-4">
              <div><strong>名称：</strong>{award.title}</div>
              <div><strong>来源：</strong>{award.source}</div>
              <div><strong>说明：</strong>{award.description}</div>
            </div>
          ))}
        </section>
      )}

      {/* 技能 */}
      {skills.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">🛠 技能列表</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
