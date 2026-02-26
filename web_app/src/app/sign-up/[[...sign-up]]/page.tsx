import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg border border-gray-200",
            headerTitle: "font-poppins text-2xl font-semibold text-gray-900",
            headerSubtitle: "text-gray-600",
            socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
            formButtonPrimary: "bg-[#C7161C] hover:bg-[#a81217] transition-colors",
            footerActionLink: "text-[#C7161C] hover:text-[#a81217] font-medium",
          },
        }}
        routing="path"
        path="/sign-up"
        redirectUrl="/"
        signInUrl="/sign-in"
      />
    </div>
  )
}
