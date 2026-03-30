import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e8d5b7] font-sans">
      <AdminSidebar />
      <main className="ml-72 min-h-screen p-12 lg:p-20">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
