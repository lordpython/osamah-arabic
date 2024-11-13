'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mainNavigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard' 
    },
    { 
      name: 'HR Operations', 
      href: '/hr',
      subItems: [
        { name: 'Attendance', href: '/hr/attendance' },
        { name: 'Driver Management', href: '/hr/drivers' },
        { name: 'Performance Reviews', href: '/hr/performance' },
        { name: 'Leave Management', href: '/hr/leave' }
      ]
    },
    { 
      name: 'Accounting', 
      href: '/accounting',
      subItems: [
        { name: 'Transactions', href: '/accounting/transactions' },
        { name: 'Driver Payments', href: '/accounting/payments' },
        { name: 'Expenses', href: '/accounting/expenses' },
        { name: 'Reports', href: '/accounting/reports' }
      ]
    }
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                {/* Brunai Logo */}
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">B</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white">Brunai</span>
                  <span className="text-xs text-blue-200">Transport Solutions</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {mainNavigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={`${
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'border-blue-300 text-white'
                        : 'border-transparent text-blue-100 hover:border-blue-200 hover:text-white'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 transition-colors`}
                  >
                    {item.name}
                  </Link>

                  {/* Dropdown for sub-items */}
                  {item.subItems && (
                    <div className="absolute hidden group-hover:block w-48 bg-white shadow-lg rounded-md py-1 z-50">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`${
                            pathname === subItem.href
                              ? 'bg-blue-50 text-blue-900'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-900'
                          } block px-4 py-2 text-sm transition-colors`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Profile and Mobile menu button */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <button className="text-blue-100 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="h-6 w-px bg-blue-300/30"></div>
              <button className="flex items-center space-x-2 text-blue-100 hover:text-white">
                <img
                  src="https://ui-avatars.com/api/?name=Admin&background=3949AB&color=fff"
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium">Admin</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-800"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-blue-900">
          <div className="pt-2 pb-3 space-y-1">
            {mainNavigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-blue-800 border-blue-300 text-white'
                      : 'border-transparent text-blue-100 hover:bg-blue-800 hover:border-blue-200 hover:text-white'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`}
                >
                  {item.name}
                </Link>
                {item.subItems && (
                  <div className="pl-4 bg-blue-800/50">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`${
                          pathname === subItem.href
                            ? 'text-white'
                            : 'text-blue-100 hover:text-white'
                        } block py-2 pl-3 pr-4 text-sm transition-colors`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
} 