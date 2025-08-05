import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { HelpCircle, Mail, MessageSquare, Phone } from "lucide-react";

export default function SupportPage() {
  // FAQ questions and answers
  const faqs = [
    {
      id: "faq-1",
      question: "How do I track my package?",
      answer: "You can track your Savitr-AI package by entering your tracking number on the Tracking page or by clicking on the shipment from your recent deliveries list on your dashboard.",
    },
    {
      id: "faq-2",
      question: "How do I change my delivery preferences?",
      answer: "Go to the Manage Deliveries page and select the 'Delivery Preferences' tab. From there, you can update your signature requirements, drop-off location, and special instructions for your deliveries.",
    },
    {
      id: "faq-3",
      question: "What does 'Delivery Manager' do?",
      answer: "Savitr-AI Delivery Manager gives you more control over your incoming packages. You can customize delivery times, redirect packages to different locations, provide delivery instructions, and receive notifications about your deliveries.",
    },
    {
      id: "faq-4",
      question: "How do I add a new delivery address?",
      answer: "Go to the Manage Deliveries page and select the 'Delivery Addresses' tab. Click on 'Add New Address' and fill out the required information to add a new delivery location to your account.",
    },
    {
      id: "faq-5",
      question: "Can I have my package delivered to a different address?",
      answer: "Yes, you can redirect your package to another address if the package hasn't been shipped yet or is early in transit. Go to the Tracking page, select your package, and choose the 'Redirect Package' option.",
    },
    {
      id: "faq-6",
      question: "How do I set up vacation holds?",
      answer: "Go to the Manage Deliveries page and select the 'Delivery Preferences' tab. Scroll down to the Vacation Hold section where you can enable the service and set your away dates. Your packages will be held securely until you return.",
    },
    {
      id: "faq-7",
      question: "What are delivery notifications and how do I set them up?",
      answer: "Delivery notifications alert you about package status changes, like when a package is shipped or delivered. Go to the Manage Deliveries page and select the 'Notifications' tab to customize your notification preferences.",
    },
    {
      id: "faq-8",
      question: "Is there a mobile app for Savitr-AI Delivery Manager?",
      answer: "Yes, Savitr-AI Delivery Manager is available as a mobile app for both iOS and Android devices. Download it from the App Store or Google Play Store to manage your deliveries on the go.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">Support Center</h1>
          <p className="text-gray-600 mb-10">Find answers or get in touch with our customer support team</p>

          {/* Hero Section */}
          <div className="bg-red-50 rounded-lg p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Phone className="w-5 h-5 mr-2 text-red-600" />
                    Call Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-gray-500">Available 24/7 for support</p>
                  <p className="font-medium">1-800-SAVITR-AI</p>
                  <p className="text-sm text-gray-500">(1-800-728-4872)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Mail className="w-5 h-5 mr-2 text-red-600" />
                    Email Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-gray-500">We'll respond within 24 hours</p>
                  <p className="font-medium">support@savitr-ai.com</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <MessageSquare className="w-5 h-5 mr-2 text-red-600" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-gray-500">Chat with our support team</p>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium mb-1">
                      First Name
                    </label>
                    <Input id="first-name" placeholder="Enter your first name" />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium mb-1">
                      Last Name
                    </label>
                    <Input id="last-name" placeholder="Enter your last name" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <Input id="email" type="email" placeholder="Enter your email address" />
                </div>

                <div>
                  <label htmlFor="tracking-number" className="block text-sm font-medium mb-1">
                    Tracking Number (optional)
                  </label>
                  <Input id="tracking-number" placeholder="Enter tracking number if applicable" />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <Input id="subject" placeholder="What is your inquiry about?" />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="How can we help you?"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Submit Request
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center">
                        <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-600" />
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7">{faq.answer}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm">
                  Need more help? Check out our{" "}
                  <a href="/help/guides" className="text-red-600 font-medium hover:underline">
                    comprehensive help guides
                  </a>
                  {" "}or{" "}
                  <a href="/help/tutorials" className="text-red-600 font-medium hover:underline">
                    video tutorials
                  </a>.
                </p>
              </div>
            </div>
          </div>

          {/* Support Offices */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Our Support Offices</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">North America</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    123 Innovation Drive<br />
                    San Francisco, CA 94103<br />
                    United States<br />
                    <span className="block mt-2 font-medium">+1 (415) 555-1234</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Europe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    45 Tech Square<br />
                    London, EC1V 9BD<br />
                    United Kingdom<br />
                    <span className="block mt-2 font-medium">+44 (20) 7123 4567</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Asia Pacific</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    88 Savitr Tower<br />
                    Singapore, 018956<br />
                    Singapore<br />
                    <span className="block mt-2 font-medium">+65 6123 4567</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Australia</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    200 Harbour Street<br />
                    Sydney, NSW 2000<br />
                    Australia<br />
                    <span className="block mt-2 font-medium">+61 (2) 8123 4567</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
