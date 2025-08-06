'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

interface ContactFormProps {
  locale: string
}

export default function ContactForm({ locale }: ContactFormProps) {
  const isZh = locale === 'zh'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    serviceType: '',
    urgency: 'normal'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          customerType: formData.serviceType || '個人',
          interestedProducts: formData.serviceType,
          source: 'website'
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          serviceType: '',
          urgency: 'normal'
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 姓名 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {isZh ? '姓名 *' : 'Name *'}
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={isZh ? '請輸入您的姓名' : 'Enter your name'}
          required
        />
      </div>

      {/* 電話 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {isZh ? '聯絡電話 *' : 'Phone *'}
        </label>
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder={isZh ? '請輸入聯絡電話' : 'Enter your phone number'}
          required
        />
      </div>

      {/* 電子信箱 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {isZh ? '電子信箱' : 'Email'}
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={isZh ? '請輸入電子信箱（選填）' : 'Enter your email (optional)'}
        />
      </div>

      {/* 服務類型 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {isZh ? '服務類型 *' : 'Service Type *'}
        </label>
        <select
          name="serviceType"
          value={formData.serviceType}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">
            {isZh ? '請選擇服務類型' : 'Select service type'}
          </option>
          <option value="r134a-filling">
            {isZh ? 'R134a 冷媒充填' : 'R134a Refrigerant Filling'}
          </option>
          <option value="r1234yf-filling">
            {isZh ? 'R1234yf 冷媒充填' : 'R1234yf Refrigerant Filling'}
          </option>
          <option value="ac-repair">
            {isZh ? '汽車冷氣維修' : 'Car AC Repair'}
          </option>
          <option value="ac-diagnosis">
            {isZh ? '冷氣系統檢測' : 'AC System Diagnosis'}
          </option>
          <option value="emergency">
            {isZh ? '緊急維修' : 'Emergency Repair'}
          </option>
          <option value="consultation">
            {isZh ? '諮詢服務' : 'Consultation'}
          </option>
          <option value="other">
            {isZh ? '其他服務' : 'Other Services'}
          </option>
        </select>
      </div>

      {/* 緊急程度 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {isZh ? '緊急程度' : 'Urgency Level'}
        </label>
        <select
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="normal">
            {isZh ? '一般 (1-2天內回覆)' : 'Normal (Reply within 1-2 days)'}
          </option>
          <option value="urgent">
            {isZh ? '緊急 (當天回覆)' : 'Urgent (Same day reply)'}
          </option>
          <option value="emergency">
            {isZh ? '急件 (2小時內回覆)' : 'Emergency (Reply within 2 hours)'}
          </option>
        </select>
      </div>

      {/* 主旨 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {isZh ? '主旨' : 'Subject'}
        </label>
        <Input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder={isZh ? '簡短描述您的需求' : 'Brief description of your needs'}
        />
      </div>

      {/* 詳細說明 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {isZh ? '詳細說明 *' : 'Detailed Description *'}
        </label>
        <Textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder={isZh ? 
            '請詳細描述您的車輛狀況、遇到的問題、車型年份等資訊，以便我們提供更準確的服務...' : 
            'Please describe your vehicle condition, issues, car model, year, etc. for more accurate service...'
          }
          rows={4}
          required
        />
      </div>

      {/* 提交按鈕 */}
      <Button 
        type="submit" 
        disabled={isSubmitting}
        variant="default"
        className="w-full"
        loading={isSubmitting}
      >
        <>
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? (isZh ? '傳送中...' : 'Sending...') : (isZh ? '立即預約服務' : 'Book Service Now')}
        </>
      </Button>

      {/* 狀態訊息 */}
      {submitStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {isZh ? (
            <>
              ✅ <strong>預約成功！</strong>我們已收到您的預約，將在您選擇的時間內回覆。
              緊急服務請直接撥打：<strong>+886-2-xxxx-xxxx</strong>
            </>
          ) : (
            <>
              ✅ <strong>Booking successful!</strong> We have received your booking and will reply within your selected timeframe.
              For emergency service, please call: <strong>+886-2-xxxx-xxxx</strong>
            </>
          )}
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {isZh ? (
            <>
              ❌ <strong>傳送失敗</strong>，請稍後再試或直接撥打服務專線：
              <strong>+886-2-xxxx-xxxx</strong>
            </>
          ) : (
            <>
              ❌ <strong>Sending failed</strong>, please try again later or call our service hotline:
              <strong>+886-2-xxxx-xxxx</strong>
            </>
          )}
        </div>
      )}

      {/* 隱私聲明 */}
      <div className="text-xs text-gray-500 mt-4">
        {isZh ? (
          <p>
            * 必填欄位。您的個人資料僅用於服務聯繫，我們重視您的隱私權，
            不會將資料提供給第三方。提交表單即表示同意我們的隱私政策。
          </p>
        ) : (
          <p>
            * Required fields. Your personal information is only used for service contact. 
            We respect your privacy and will not share your data with third parties. 
            Submitting this form indicates agreement to our privacy policy.
          </p>
        )}
      </div>
    </form>
  )
} 