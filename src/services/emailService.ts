import emailjs from 'emailjs-com';

// Initialize EmailJS with your public key
emailjs.init('sYfnZeIDOxAl4y-r9');

export interface EmailTemplateParams {
  order_id: string;
  email: string;
  orders: Array<{
    name: string;
    units: number;
    price: string;
    image_url: string;
  }>;
  cost: {
    shipping: string;
    total: string;
  };
}

export const sendOrderEmail = async (templateParams: EmailTemplateParams): Promise<void> => {
  try {
    const response = await emailjs.send(
      'service_pvd829d',
      'template_omc5g2b',
      templateParams as any,
      'sYfnZeIDOxAl4y-r9'
    );
    
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 