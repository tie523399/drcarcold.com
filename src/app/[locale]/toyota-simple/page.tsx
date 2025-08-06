export default function ToyotaSimplePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb', fontSize: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
        Toyota 豐田汽車冷媒充填服務
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ color: '#1e40af', fontSize: '1.5rem', marginBottom: '1rem' }}>
          R134a R1234yf 冷媒產品批發 | PAG冷凍油 | 專業充填機
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#374151', maxWidth: '800px', margin: '0 auto' }}>
          專業 Toyota 豐田汽車冷媒充填服務，提供 R134a、R1234yf 環保冷媒、PAG 冷凍油、冷媒充填機等產品批發。涵蓋全車系冷氣維修，30年經驗，原廠規格，品質保證。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1e40af' }}>🔧 全車系支援</h3>
          <p style={{ color: '#374151' }}>Camry、Corolla、RAV4、Prius、Sienta 等全車系冷媒規格</p>
        </div>
        
        <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1e40af' }}>🌿 環保冷媒</h3>
          <p style={{ color: '#374151' }}>R134a、R1234yf 環保冷媒，符合最新環保法規</p>
        </div>
        
        <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1e40af' }}>⚡ 專業設備</h3>
          <p style={{ color: '#374151' }}>冷媒充填機、回收機、PAG冷凍油等專業設備批發</p>
        </div>
        
        <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1e40af' }}>🛡️ 品質保證</h3>
          <p style={{ color: '#374151' }}>原廠規格、ISO認證、30年專業經驗保證</p>
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>
          🚗 Toyota 熱門車型冷媒規格
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'Camry', year: '2020-2024', type: 'R1234yf', amount: '550g', oil: 'PAG 46' },
            { name: 'Corolla', year: '2019-2024', type: 'R1234yf', amount: '400g', oil: 'PAG 46' },
            { name: 'RAV4', year: '2019-2024', type: 'R1234yf', amount: '580g', oil: 'PAG 46' },
            { name: 'Prius', year: '2016-2024', type: 'R134a', amount: '300g', oil: 'PAG 46' },
            { name: 'Sienta', year: '2018-2024', type: 'R134a', amount: '350g', oil: 'PAG 46' },
            { name: 'Alphard', year: '2020-2024', type: 'R1234yf', amount: '680g', oil: 'PAG 46' }
          ].map((model, index) => (
            <div key={index} style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#1f2937' }}>
                Toyota {model.name}
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                <p><strong>年份:</strong> {model.year}</p>
                <p><strong>冷媒類型:</strong> 
                  <span style={{ 
                    marginLeft: '8px', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: model.type === 'R1234yf' ? '#dcfce7' : '#dbeafe',
                    color: model.type === 'R1234yf' ? '#166534' : '#1e40af',
                    fontSize: '0.8rem'
                  }}>
                    {model.type}
                  </span>
                </p>
                <p><strong>充填量:</strong> {model.amount}</p>
                <p><strong>冷凍油:</strong> {model.oil}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>
          🛒 Toyota 專用冷媒產品
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              title: 'R134a 冷媒 13.6kg',
              desc: 'Toyota 車系通用 R134a 冷媒，純度 99.9%',
              price: 'NT$ 2,800',
              features: ['純度99.9%', '原廠規格', '環保認證']
            },
            {
              title: 'R1234yf 冷媒 10kg',
              desc: '新世代環保冷媒，適用 2015 年後車型',
              price: 'NT$ 4,200',
              features: ['低GWP值', '最新環保', '歐盟認證']
            },
            {
              title: 'PAG 46 冷凍油',
              desc: '專用冷凍油，適用 R134a 系統',
              price: 'NT$ 380',
              features: ['高潤滑性', '防腐蝕', '相容性佳']
            }
          ].map((product, index) => (
            <div key={index} style={{ 
              backgroundColor: '#f9fafb', 
              padding: '1.5rem', 
              borderRadius: '8px' 
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1f2937' }}>{product.title}</h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{product.desc}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '1rem' }}>{product.price}</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {product.features.map((feature, idx) => (
                  <li key={idx} style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.3rem' }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#2563eb', 
        color: 'white', 
        padding: '3rem 2rem', 
        borderRadius: '8px', 
        textAlign: 'center' 
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬 專業技術諮詢</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          需要 Toyota 冷媒技術支援？我們的專業團隊隨時為您服務！
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/zh/contact" 
            style={{ 
              backgroundColor: 'white', 
              color: '#2563eb', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            立即聯繫
          </a>
          <a 
            href="/zh/products" 
            style={{ 
              border: '2px solid white', 
              color: 'white', 
              padding: '10px 24px', 
              borderRadius: '8px', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            查看產品
          </a>
        </div>
      </div>
    </div>
  )
}