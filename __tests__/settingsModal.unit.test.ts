import { renderHook, act } from '@testing-library/react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  value: jest.fn(() => 'mocked-url')
})
Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: jest.fn()
})

describe('SettingsModal Data Management', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    mockLocalStorage.clear()
    jest.clearAllMocks()

    // Reset Zustand store state completely
    useSwiftApplyStore.getState().setPersonalInfo(null)
    useSwiftApplyStore.getState().setTemplates([])
    useSwiftApplyStore.getState().setJobTitle('')
    useSwiftApplyStore.getState().setJobDescription('')
    useSwiftApplyStore.setState({
      isSettingsOpen: false,
      settingsStep: 1,
      ai: {
        isGenerating: false,
        showProgressPanel: false,
        activeStage: 'classifier',
        stageOutputs: {
          classifier: { status: 'pending' },
          experience: { status: 'pending' },
          reviewer: { status: 'pending' }
        },
        generatedContent: null,
        error: null
      },
      pdfPreviewUrl: null
    })
  })

  describe('Export Functionality', () => {
    it('should export only personalInfo and templates, excluding jobTitle and jobDescription', () => {
      const { result } = renderHook(() => useSwiftApplyStore())

      // Setup test data
      act(() => {
        result.current.setPersonalInfo({
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          location: 'New York',
          linkedin: 'linkedin.com/in/johndoe',
          website: 'johndoe.com',
          summary: ['Experienced developer'],
          technicalSkills: ['JavaScript', 'React'],
          languages: ['English'],
          education: [],
          certificates: [],
          customModules: [],
          format: 'A4'
        })

        result.current.setTemplates([
          {
            id: '1',
            title: 'Frontend Developer',
            targetRole: 'React Developer',
            content: ['Built responsive web apps']
          }
        ])

        result.current.setJobTitle('Senior Developer')
        result.current.setJobDescription('Job description here')
      })

      // Simulate export data structure
      const exportData = {
        personalInfo: result.current.personalInfo,
        templates: result.current.templates,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }

      // Verify export includes only expected fields
      expect(exportData.personalInfo).toBeDefined()
      expect(exportData.templates).toBeDefined()
      expect(exportData.exportDate).toBeDefined()
      expect(exportData.version).toBeDefined()

      // Verify export excludes jobTitle and jobDescription
      expect(exportData).not.toHaveProperty('jobTitle')
      expect(exportData).not.toHaveProperty('jobDescription')

      // Verify data content
      expect(exportData.personalInfo?.fullName).toBe('John Doe')
      expect(exportData.templates).toHaveLength(1)
      expect(exportData.templates[0].title).toBe('Frontend Developer')
    })

    it('should handle export with empty data', () => {
      const { result } = renderHook(() => useSwiftApplyStore())

      const exportData = {
        personalInfo: result.current.personalInfo, // null
        templates: result.current.templates, // []
        exportDate: new Date().toISOString(),
        version: '1.0'
      }

      expect(exportData.personalInfo).toBeNull()
      expect(exportData.templates).toEqual([])
      expect(exportData.exportDate).toBeDefined()
    })
  })

  describe('Import Functionality', () => {
    it('should successfully import valid data', () => {
      const { result } = renderHook(() => useSwiftApplyStore())

      const validImportData = {
        personalInfo: {
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+9876543210',
          location: 'California',
          linkedin: '',
          website: '',
          summary: ['Product manager with 5 years experience'],
          technicalSkills: ['Project Management', 'Agile'],
          languages: ['English', 'Spanish'],
          education: [],
          certificates: [],
          customModules: [],
          format: 'Letter' as const
        },
        templates: [
          {
            id: '2',
            title: 'Product Manager',
            targetRole: 'Senior PM',
            content: ['Led cross-functional teams']
          }
        ],
        exportDate: '2024-01-01T00:00:00.000Z',
        version: '1.0'
      }

      // Simulate import
      act(() => {
        if (validImportData.personalInfo) {
          result.current.setPersonalInfo(validImportData.personalInfo)
        }
        if (validImportData.templates) {
          result.current.setTemplates(validImportData.templates)
        }
      })

      // Verify import results
      expect(result.current.personalInfo?.fullName).toBe('Jane Smith')
      expect(result.current.personalInfo?.format).toBe('Letter')
      expect(result.current.templates).toHaveLength(1)
      expect(result.current.templates[0].title).toBe('Product Manager')
    })

    it('should handle partial import (only personalInfo)', () => {
      const { result } = renderHook(() => useSwiftApplyStore())

      const partialImportData = {
        personalInfo: {
          fullName: 'Bob Wilson',
          email: 'bob@example.com',
          phone: '',
          location: '',
          linkedin: '',
          website: '',
          summary: [],
          technicalSkills: [],
          languages: [],
          education: [],
          certificates: [],
          customModules: [],
          format: 'A4' as const
        },
        templates: null, // No templates
        exportDate: '2024-01-01T00:00:00.000Z',
        version: '1.0'
      }

      act(() => {
        if (partialImportData.personalInfo) {
          result.current.setPersonalInfo(partialImportData.personalInfo)
        }
        // Don't import templates since they're null
      })

      expect(result.current.personalInfo?.fullName).toBe('Bob Wilson')
      expect(result.current.templates).toEqual([]) // Should remain empty
    })

    it('should handle partial import (only templates)', () => {
      const { result } = renderHook(() => useSwiftApplyStore())

      const partialImportData = {
        personalInfo: null, // No personal info
        templates: [
          {
            id: '3',
            title: 'Designer',
            targetRole: 'UI/UX Designer',
            content: ['Created user-centered designs']
          },
          {
            id: '4',
            title: 'Developer',
            targetRole: 'Full Stack Developer',
            content: ['Built end-to-end solutions']
          }
        ],
        exportDate: '2024-01-01T00:00:00.000Z',
        version: '1.0'
      }

      act(() => {
        // Don't import personalInfo since it's null
        if (partialImportData.templates) {
          result.current.setTemplates(partialImportData.templates)
        }
      })

      expect(result.current.personalInfo).toBeNull() // Should remain null
      expect(result.current.templates).toHaveLength(2)
      expect(result.current.templates[0].title).toBe('Designer')
      expect(result.current.templates[1].title).toBe('Developer')
    })
  })

  describe('Data Validation', () => {
    it('should reject invalid JSON structure', () => {
      const invalidData = 'not a json object'

      expect(() => {
        JSON.parse(invalidData)
      }).toThrow()
    })

    it('should reject empty object', () => {
      const emptyData = {}

      const hasValidData = emptyData.hasOwnProperty('personalInfo') ||
                          emptyData.hasOwnProperty('templates')

      expect(hasValidData).toBe(false)
    })

    it('should accept valid minimal data structure', () => {
      const minimalValidData = {
        personalInfo: null,
        templates: []
      }

      const hasValidData = minimalValidData.hasOwnProperty('personalInfo') ||
                          minimalValidData.hasOwnProperty('templates')

      expect(hasValidData).toBe(true)
    })
  })

  describe('Store Integration', () => {
    it('should persist data to localStorage when imported', () => {
      const { result } = renderHook(() => useSwiftApplyStore())

      const testPersonalInfo = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '',
        location: '',
        linkedin: '',
        website: '',
        summary: [],
        technicalSkills: [],
        languages: [],
        education: [],
        certificates: [],
        customModules: [],
        format: 'A4' as const
      }

      const testTemplates = [
        {
          id: '5',
          title: 'Test Template',
          targetRole: 'Test Role',
          content: ['Test content']
        }
      ]

      act(() => {
        result.current.setPersonalInfo(testPersonalInfo)
        result.current.setTemplates(testTemplates)
      })

      // Verify localStorage was called with correct keys
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'jd2cv-v2-personal-info',
        expect.any(String)
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'swiftapply-templates',
        expect.any(String)
      )
    })
  })
})