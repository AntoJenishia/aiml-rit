"use client"
import { Settings, Bell, Shield, Globe, Save } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="h-6 w-6 text-slate-600" /> Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure department portal preferences</p>
      </div>

      <div className="space-y-4">
        {/* Notifications */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-700">Notifications</h2>
              <p className="text-xs text-slate-400">Control who gets notified and when</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Email notifications for new registrations", defaultOn: true  },
              { label: "Email digest for weekly activity",          defaultOn: false },
              { label: "Alert on new announcements posted",         defaultOn: true  },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 min-h-[44px] bg-slate-50/60 border border-slate-100 cursor-pointer hover:bg-slate-50">
                <span className="text-sm text-slate-600">{item.label}</span>
                <input type="checkbox" defaultChecked={item.defaultOn}
                  className="h-4 w-4 rounded accent-blue-600" />
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-700">Security</h2>
              <p className="text-xs text-slate-400">Authentication and access control</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Restrict login to @ritchennai.edu.in only",     defaultOn: true  },
              { label: "Auto-revoke access after 90 days inactive",     defaultOn: false },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 min-h-[44px] bg-slate-50/60 border border-slate-100 cursor-pointer hover:bg-slate-50">
                <span className="text-sm text-slate-600">{item.label}</span>
                <input type="checkbox" defaultChecked={item.defaultOn}
                  className="h-4 w-4 rounded accent-emerald-600" />
              </label>
            ))}
          </div>
        </div>

        {/* Site info */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Globe className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-700">Site Information</h2>
              <p className="text-xs text-slate-400">Portal metadata</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Portal Name</label>
              <input defaultValue="AIML Department Portal"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Department Email</label>
              <input defaultValue="aiml@ritchennai.edu.in"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button onClick={handleSave}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-3 min-h-[44px] text-sm font-semibold text-white shadow-lg transition-all active:scale-95
              ${saved ? "bg-emerald-500 shadow-emerald-500/30" : "bg-blue-600 shadow-blue-500/30 hover:bg-blue-700"}`}>
            <Save className="h-4 w-4" />
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  )
}
