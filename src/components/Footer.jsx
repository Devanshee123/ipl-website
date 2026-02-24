import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

export default function Footer() {
  const quickLinks = [
    { label: 'About Us', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Terms & Conditions', href: '#' },
    { label: 'Privacy Policy', href: '#' }
  ]

  const support = [
    { label: 'Help Center', href: '#' },
    { label: 'FAQs', href: '#' },
    { label: 'Cancellation Policy', href: '#' },
    { label: 'Refund Status', href: '#' }
  ]

  const social = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' }
  ]

  return (
    <footer className="bg-[#F5F5F5] border-t border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-[#F84464] mb-4">TicketNest</h3>
            <p className="text-[#666666] text-sm mb-4">
              Your trusted partner for IPL ticket bookings. Experience the thrill of live cricket with us.
            </p>
            <div className="flex gap-3">
              {social.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  className="w-9 h-9 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#666666] transition-all duration-200 hover:text-white hover:bg-[#F84464] hover:border-[#F84464]"
                >
                  <item.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-[#222222] mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#666666] hover:text-[#F84464] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium text-[#222222] mb-4">Support</h4>
            <ul className="space-y-2.5">
              {support.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#666666] hover:text-[#F84464] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-[#222222] mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <Mail className="w-4 h-4 text-[#F84464]" />
                support@ticketnest.com
              </div>
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <Phone className="w-4 h-4 text-[#F84464]" />
                +91 1800-123-4567
              </div>
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <MapPin className="w-4 h-4 text-[#F84464]" />
                Mumbai, India
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-[#999999] text-sm text-center">
            © 2024 TicketNest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
