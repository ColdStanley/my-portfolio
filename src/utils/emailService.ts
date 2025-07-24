import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  user: string
  pass: string
  from: string
  to: string
}

interface TaskData {
  id: string
  title: string
  status: string
  start_date?: string
  end_date?: string
  priority_quadrant?: string
  plan?: string[]
  note?: string
}

interface EmailContent {
  subject: string
  html: string
}

class EmailService {
  private transporter: nodemailer.Transporter
  private config: EmailConfig

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || '',
      to: process.env.SMTP_TO || ''
    }

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.config.user,
        pass: this.config.pass
      }
    })
  }

  private formatTimeRange(startDate?: string, endDate?: string): string {
    if (!startDate) return ''
    
    const formatTime = (dateStr: string) => {
      // Extract time from Toronto timezone format: "2025-07-24T09:00:00-04:00"
      const timePart = dateStr.split('T')[1]
      if (!timePart) return ''
      return timePart.substring(0, 5) // "09:00"
    }

    const startTime = formatTime(startDate)
    if (!endDate) return startTime
    
    const endTime = formatTime(endDate)
    return `${startTime} - ${endTime}`
  }

  private getPriorityEmoji(priority?: string): string {
    switch (priority) {
      case 'Important & Urgent': return '🔴'
      case 'Important & Not Urgent': return '🟡'
      case 'Not Important & Urgent': return '🟠'
      case 'Not Important & Not Urgent': return '🟢'
      default: return '📋'
    }
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'Not Started': return '⏳'
      case 'In Progress': return '🔄'
      case 'Completed': return '✅'
      case 'On Hold': return '⏸️'
      case 'Cancelled': return '❌'
      default: return '📋'
    }
  }

  private generateMorningEmail(tasks: TaskData[]): EmailContent {
    const todayTasks = tasks.filter(task => task.status !== 'Completed')
    
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7c3aed; margin-bottom: 20px;">🌅 Good Morning! Today's Tasks</h2>
        <p style="color: #6b7280; margin-bottom: 30px;">Here are your planned tasks for today:</p>
    `

    if (todayTasks.length === 0) {
      html += '<p style="color: #10b981; font-size: 18px;">🎉 No tasks scheduled for today! Enjoy your free day.</p>'
    } else {
      todayTasks.forEach(task => {
        const timeRange = this.formatTimeRange(task.start_date, task.end_date)
        const priorityEmoji = this.getPriorityEmoji(task.priority_quadrant)
        const statusEmoji = this.getStatusEmoji(task.status)
        
        html += `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #f9fafb;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 20px; margin-right: 8px;">${priorityEmoji}</span>
              <h3 style="margin: 0; color: #1f2937; font-size: 16px;">${task.title}</h3>
            </div>
            <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">
              ${statusEmoji} ${task.status} ${timeRange ? `• ⏰ ${timeRange}` : ''}
            </div>
            ${task.note ? `<div style="color: #6b7280; font-size: 12px; margin-top: 8px; padding: 8px; background-color: #f3f4f6; border-radius: 4px;">${task.note}</div>` : ''}
          </div>
        `
      })
    }

    html += `
        <div style="margin-top: 30px; padding: 16px; background-color: #ede9fe; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #7c3aed; font-weight: bold;">Have a productive day! 💪</p>
        </div>
      </div>
    `

    return {
      subject: `🌅 Today's Tasks - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
      html
    }
  }

  private generateAfternoonEmail(tasks: TaskData[]): EmailContent {
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress')
    const notStartedTasks = tasks.filter(task => task.status === 'Not Started')
    
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7c3aed; margin-bottom: 20px;">☀️ Afternoon Check-in</h2>
        <p style="color: #6b7280; margin-bottom: 30px;">How's your day going? Here's your progress:</p>
    `

    if (inProgressTasks.length > 0) {
      html += '<h3 style="color: #059669; margin-bottom: 16px;">🔄 Tasks in Progress</h3>'
      inProgressTasks.forEach(task => {
        const timeRange = this.formatTimeRange(task.start_date, task.end_date)
        html += `
          <div style="border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #ecfdf5;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937;">${task.title}</h4>
            <div style="color: #6b7280; font-size: 14px;">${timeRange ? `⏰ ${timeRange}` : ''}</div>
          </div>
        `
      })
    }

    if (notStartedTasks.length > 0) {
      html += '<h3 style="color: #dc2626; margin-bottom: 16px;">⏳ Still To Do</h3>'
      notStartedTasks.forEach(task => {
        const timeRange = this.formatTimeRange(task.start_date, task.end_date)
        html += `
          <div style="border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #fef2f2;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937;">${task.title}</h4>
            <div style="color: #6b7280; font-size: 14px;">${timeRange ? `⏰ ${timeRange}` : ''}</div>
          </div>
        `
      })
    }

    if (inProgressTasks.length === 0 && notStartedTasks.length === 0) {
      html += '<p style="color: #10b981; font-size: 18px;">🎉 Great job! All tasks are completed or you\'re having a break day.</p>'
    }

    html += `
        <div style="margin-top: 30px; padding: 16px; background-color: #ede9fe; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #7c3aed; font-weight: bold;">Keep up the great work! 🚀</p>
        </div>
      </div>
    `

    return {
      subject: `☀️ Afternoon Progress Check - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
      html
    }
  }

  private generateEveningEmail(tasks: TaskData[]): EmailContent {
    const completedTasks = tasks.filter(task => task.status === 'Completed')
    const incompleteTasks = tasks.filter(task => task.status !== 'Completed')
    
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7c3aed; margin-bottom: 20px;">🌙 Evening Summary</h2>
        <p style="color: #6b7280; margin-bottom: 30px;">Let's review your day:</p>
    `

    // Completed tasks section
    if (completedTasks.length > 0) {
      html += `<h3 style="color: #10b981; margin-bottom: 16px;">✅ Completed Today (${completedTasks.length})</h3>`
      completedTasks.forEach(task => {
        html += `
          <div style="border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #ecfdf5;">
            <h4 style="margin: 0; color: #1f2937; text-decoration: line-through; opacity: 0.8;">${task.title}</h4>
          </div>
        `
      })
    }

    // Incomplete tasks section
    if (incompleteTasks.length > 0) {
      html += `<h3 style="color: #dc2626; margin-bottom: 16px;">⚠️ Needs Attention (${incompleteTasks.length})</h3>`
      incompleteTasks.forEach(task => {
        const timeRange = this.formatTimeRange(task.start_date, task.end_date)
        html += `
          <div style="border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #fef2f2;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937;">${task.title}</h4>
            <div style="color: #6b7280; font-size: 14px;">
              ${this.getStatusEmoji(task.status)} ${task.status} ${timeRange ? `• ⏰ ${timeRange}` : ''}
            </div>
          </div>
        `
      })
    }

    // Summary
    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 100
    let summaryText = ''
    let summaryColor = ''
    
    if (completionRate >= 80) {
      summaryText = 'Excellent work today! 🌟'
      summaryColor = '#10b981'
    } else if (completionRate >= 60) {
      summaryText = 'Good progress today! 👍'
      summaryColor = '#f59e0b'
    } else {
      summaryText = 'Tomorrow is a new opportunity! 💪'
      summaryColor = '#dc2626'
    }

    html += `
        <div style="margin-top: 30px; padding: 16px; background-color: #ede9fe; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: ${summaryColor}; font-weight: bold; font-size: 18px;">${summaryText}</p>
          <p style="margin: 0; color: #7c3aed;">Completion Rate: ${completionRate}%</p>
        </div>
      </div>
    `

    return {
      subject: `🌙 Evening Summary - ${completionRate}% Complete`,
      html
    }
  }

  async sendTaskReminder(tasks: TaskData[], timeOfDay: 'morning' | 'afternoon' | 'evening'): Promise<void> {
    let emailContent: EmailContent

    switch (timeOfDay) {
      case 'morning':
        emailContent = this.generateMorningEmail(tasks)
        break
      case 'afternoon':
        emailContent = this.generateAfternoonEmail(tasks)
        break
      case 'evening':
        emailContent = this.generateEveningEmail(tasks)
        break
      default:
        throw new Error('Invalid time of day')
    }

    const mailOptions = {
      from: this.config.from,
      to: this.config.to,
      subject: emailContent.subject,
      html: emailContent.html
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.messageId)
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  // Generate mobile-optimized single task reminder email
  private generateSingleTaskEmail(task: TaskData): EmailContent {
    const timeRange = this.formatTimeRange(task.start_date, task.end_date)
    const priorityEmoji = this.getPriorityEmoji(task.priority_quadrant)
    
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  max-width: 600px; margin: 0 auto; padding: 16px; 
                  background-color: #f8fafc; min-height: 100vh;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: 600; color: #1e293b; margin: 0;">
            ⏰ Starting Soon
          </h1>
          <p style="font-size: 16px; color: #64748b; margin: 8px 0 0 0;">
            Your task begins in 5 minutes
          </p>
        </div>

        <!-- Task Card -->
        <div style="background: white; border-radius: 12px; padding: 24px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
                    margin-bottom: 24px;">
          
          <!-- Task Title -->
          <h2 style="font-size: 20px; font-weight: 600; color: #1e293b; 
                     margin: 0 0 16px 0; line-height: 1.3;">
            ${task.title}
          </h2>

          <!-- Time and Duration -->
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="background: #e0e7ff; color: #3730a3; padding: 8px 12px; 
                       border-radius: 8px; font-size: 16px; font-weight: 500;">
              ${timeRange}
            </div>
          </div>

          <!-- Priority -->
          ${task.priority_quadrant ? `
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <span style="font-size: 18px; margin-right: 8px;">${priorityEmoji}</span>
              <span style="background: ${this.getPriorityBgColor(task.priority_quadrant)}; 
                          color: ${this.getPriorityTextColor(task.priority_quadrant)}; 
                          padding: 6px 12px; border-radius: 6px; 
                          font-size: 14px; font-weight: 500;">
                ${task.priority_quadrant}
              </span>
            </div>
          ` : ''}

          <!-- Notes -->
          ${task.note ? `
            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; 
                       margin-bottom: 16px; border-left: 4px solid #7c3aed;">
              <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.5;">
                <strong style="color: #334155;">Notes:</strong><br>
                ${task.note}
              </p>
            </div>
          ` : ''}
        </div>

        <!-- Action Buttons -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="https://stanleyhi.com/cestlavie" 
             style="display: inline-block; background: #7c3aed; color: white; 
                    padding: 16px 32px; border-radius: 8px; text-decoration: none; 
                    font-size: 16px; font-weight: 600; margin-bottom: 12px;
                    min-width: 200px; text-align: center;">
            🚀 Open Task Manager
          </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 14px;">
          <p style="margin: 0;">
            💪 Stay focused! You've got this.
          </p>
        </div>
      </div>
    `

    return {
      subject: `⏰ ${task.title} starts in 5 min`,
      html
    }
  }

  // Helper methods for priority styling
  private getPriorityBgColor(priority: string): string {
    switch (priority) {
      case 'Important & Urgent': return '#fef2f2'
      case 'Important & Not Urgent': return '#fef3c7' 
      case 'Not Important & Urgent': return '#fed7c7'
      case 'Not Important & Not Urgent': return '#f3f4f6'
      default: return '#f8fafc'
    }
  }

  private getPriorityTextColor(priority: string): string {
    switch (priority) {
      case 'Important & Urgent': return '#dc2626'
      case 'Important & Not Urgent': return '#d97706'
      case 'Not Important & Urgent': return '#ea580c'  
      case 'Not Important & Not Urgent': return '#6b7280'
      default: return '#7c3aed'
    }
  }

  // Send single task reminder
  async sendSingleTaskReminder(task: TaskData): Promise<void> {
    const emailContent = this.generateSingleTaskEmail(task)

    const mailOptions = {
      from: this.config.from,
      to: this.config.to,
      subject: emailContent.subject,
      html: emailContent.html
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Single task reminder sent successfully:', info.messageId)
    } catch (error) {
      console.error('Error sending single task reminder:', error)
      throw error
    }
  }

  // Test email functionality  
  async sendTestEmail(): Promise<void> {
    const testTask: TaskData = {
      id: '1',
      title: 'Review project documentation',
      status: 'Not Started', 
      start_date: '2025-07-24T09:00:00-04:00',
      end_date: '2025-07-24T10:00:00-04:00',
      priority_quadrant: 'Important & Urgent',
      note: 'Focus on API documentation updates and prepare feedback for the team meeting'
    }

    await this.sendSingleTaskReminder(testTask)
  }
}

export default EmailService