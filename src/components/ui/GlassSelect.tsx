import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface GlassSelectOption {
  value: string
  label: string
}

interface GlassSelectProps {
  value: string
  onChange: (value: string) => void
  options: GlassSelectOption[]
  placeholder?: string
  className?: string
  icon?: React.ReactNode
}

export function GlassSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  icon,
}: GlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, handleClickOutside])

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`glass-select-trigger w-full ${isOpen ? 'glass-select-open' : ''}`}
      >
        {icon && <span className="shrink-0 text-[#475569]">{icon}</span>}
        <span className="flex-1 text-left truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#64748b] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="glass-select-dropdown">
          <div className="py-1 max-h-[240px] overflow-y-auto glass-select-scroll">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`glass-select-option ${opt.value === value ? 'glass-select-option-active' : ''}`}
              >
                <span className="flex-1 text-left">{opt.label}</span>
                {opt.value === value && (
                  <Check className="w-3.5 h-3.5 shrink-0 text-[#FF4500]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
