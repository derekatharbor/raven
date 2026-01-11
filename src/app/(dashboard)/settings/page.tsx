// Route: src/app/(dashboard)/settings/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { User, Key, CreditCard, Bell } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account')

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'sources', label: 'Data Sources', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <nav className="w-48 flex-shrink-0">
          <ul className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6">
          {activeTab === 'account' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    placeholder="you@example.com"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Sources</h2>
              <p className="text-gray-600 mb-6">Connect your data sources to enable claim verification.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">N</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">News API</p>
                      <p className="text-sm text-gray-500">Search news articles</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Connect
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">B</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Brave Search</p>
                      <p className="text-sm text-gray-500">Web search results</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Connect
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">G</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Google Sheets</p>
                      <p className="text-sm text-gray-500">Connect your spreadsheets</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Connect
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Key size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Custom API</p>
                      <p className="text-sm text-gray-500">Connect any REST API</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Current Plan</p>
                <p className="text-xl font-bold text-gray-900">Free</p>
                <p className="text-sm text-gray-500 mt-1">3 documents • 10 claims • Daily checks</p>
              </div>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Upgrade to Pro
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Contradiction alerts</p>
                    <p className="text-sm text-gray-500">Get notified when a claim is contradicted</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-300" />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Weekly digest</p>
                    <p className="text-sm text-gray-500">Summary of all claim checks</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 rounded border-gray-300" />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Check failures</p>
                    <p className="text-sm text-gray-500">Alert when a source check fails</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-300" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
