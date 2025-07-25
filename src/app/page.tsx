import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages, FileText, Zap, Shield, Globe, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Languages className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SmartTranslate</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Professional
            <span className="text-blue-600"> AI Translation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your documents with cutting-edge AI technology. 
            Upload files, paste text, or type directly to get instant, accurate translations 
            powered by OpenAI's latest models.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Translating Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-gray-600">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">99.9%</div>
              <div className="text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10k+</div>
              <div className="text-gray-600">Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose SmartTranslate?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the next generation of document translation with AI-powered precision and speed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Get instant translations powered by OpenAI's O3 model with unmatched speed and accuracy.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <FileText className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Multiple Formats</CardTitle>
                <CardDescription>
                  Support for text files, Word documents, and direct text input with formatting preservation.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your documents are processed securely with enterprise-grade encryption and privacy protection.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Globe className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>50+ Languages</CardTitle>
                <CardDescription>
                  Translate between over 50 languages with native-level accuracy and cultural context awareness.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Users className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Share translations with your team and collaborate on multilingual projects seamlessly.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Languages className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Context Aware</CardTitle>
                <CardDescription>
                  AI understands context, tone, and industry-specific terminology for perfect translations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Translation Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust SmartTranslate for their document translation needs.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Languages className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold text-white">SmartTranslate</span>
              </div>
              <p className="text-gray-400">
                Professional AI-powered document translation for the modern world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SmartTranslate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
