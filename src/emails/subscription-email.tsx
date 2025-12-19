import React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  Preview,
  Section,
  Hr,
  Button,
  Link,
  Img
} from '@react-email/components';

interface SubscriptionEmailProps {
  email: string;
}

export default function SubscriptionEmail({ email }: SubscriptionEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  
  return (
    <Html>
      <Head />
      <Preview>Thank you for subscribing to Falcon Estates!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Img src={`${baseUrl}/logo.png`} width="40" height="40" alt="Falcon Estates" style={logo}/>
            <Heading style={heading}>Welcome Aboard!</Heading>
            <Text style={paragraph}>
              Thank you for subscribing to the Falcon Estates newsletter. You're now on the list to receive the latest property listings, exclusive offers, and news from the world of Delhi real estate and interior design.
            </Text>
            <Text style={paragraph}>
              We're excited to have you with us. Whether you're looking to buy, sell, rent, or design, we're here to help you every step of the way.
            </Text>
            <Button style={button} href={`${baseUrl}/properties`}>
              Explore Properties
            </Button>
            <Hr style={hr} />
            <Text style={footer}>
              You received this email because you subscribed to our newsletter. If you didn't subscribe, you can safely ignore this email.
            </Text>
             <Text style={footer}>
              Falcon Estates | Rohini, Vijay Vihar, Delhi 110085
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e2e8f0',
};

const box = {
  padding: '0 48px',
};

const logo = {
    margin: '0 auto',
    marginBottom: '24px',
};

const heading = {
  color: '#1a202c',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const paragraph = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#5A31F4',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '14px 0',
  marginTop: '32px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};
