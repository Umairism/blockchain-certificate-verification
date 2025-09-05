import { Certificate, VerificationResult, Block } from '../types';

// Mock API functions - replace with actual backend calls
export const api = {
  addCertificate: async (certificate: Omit<Certificate, 'id'>): Promise<Certificate> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newCertificate: Certificate = {
      ...certificate,
      id: `CERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
      blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      isValid: true,
      status: certificate.status || 'active',
      createdAt: certificate.createdAt || new Date().toISOString()
    };
    
    // Store in localStorage for demo purposes
    const stored = localStorage.getItem('certificates');
    const certificates = stored ? JSON.parse(stored) : [];
    certificates.push(newCertificate);
    localStorage.setItem('certificates', JSON.stringify(certificates));
    
    return newCertificate;
  },

  verifyCertificate: async (certificateId: string): Promise<VerificationResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const stored = localStorage.getItem('certificates');
    const certificates: Certificate[] = stored ? JSON.parse(stored) : [];
    
    const certificate = certificates.find(cert => cert.id === certificateId.toUpperCase());
    
    if (certificate) {
      return {
        isValid: certificate.status === 'active',
        certificate,
        message: certificate.status === 'active' 
          ? 'Certificate verified successfully' 
          : 'Certificate has been revoked'
      };
    }
    
    return {
      isValid: false,
      message: 'Certificate not found or invalid'
    };
  },

  getBlockchain: async (): Promise<Block[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const stored = localStorage.getItem('certificates');
    const certificates: Certificate[] = stored ? JSON.parse(stored) : [];
    
    return certificates.map((cert, index) => ({
      id: index + 1,
      hash: cert.blockHash || `0x${Math.random().toString(16).substr(2, 64)}`,
      previousHash: index === 0 ? '0x0000000000000000000000000000000000000000000000000000000000000000' : `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: new Date(cert.issueDate).toISOString(),
      data: cert,
      nonce: Math.floor(Math.random() * 1000000)
    }));
  }
};

export const generateCertificateId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 9);
  return `CERT_${timestamp}_${random}`.toUpperCase();
};