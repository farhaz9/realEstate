
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
} from '@react-email/components';

interface SubscriptionEmailProps {
  email: string;
}

export default function SubscriptionEmail({ email }: SubscriptionEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const FalconLogo = () => (
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '0.1em', color: '#1a202c' }}>
        FALCON
      </div>
      <div style={{ fontSize: '10px', letterSpacing: '0.4em', color: '#5A31F4', textTransform: 'uppercase' }}>
        ESTATES
      </div>
    </div>
  );

  return (
    <Html>
      <Head />
      <Preview>Welcome to the Falcon Estates Newsletter!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <FalconLogo />
            <Heading style={heading}>You're on the list!</Heading>
            <Text style={paragraph}>
              Thank you for subscribing to the Falcon Estates newsletter. You're now set to receive the latest property listings, exclusive offers, and news from the world of Delhi real estate and interior design.
            </Text>
            <Button style={button} href={`${baseUrl}/properties`}>
              Explore Latest Properties
            </Button>
            <Hr style={hr} />
            <Section style={{ textAlign: 'center', marginTop: '32px' }}>
                <Link href="#" style={socialLink}>Facebook</Link>
                <span style={dot}> &sdot; </span>
                <Link href="#" style={socialLink}>Instagram</Link>
                <span style={dot}> &sdot; </span>
                <Link href="#" style={socialLink}>Twitter</Link>
            </Section>
            <Text style={footer}>
              You received this email because you subscribed to our newsletter. If you believe this was a mistake, you can safely ignore this email.
            </Text>
             <Text style={footer}>
              &copy; {new Date().getFullYear()} Falcon Estates. All Rights Reserved.
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
  margin: '40px auto',
  padding: '40px',
  marginBottom: '64px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e2e8f0',
  maxWidth: '600px',
};

const box = {
  padding: '0 24px',
};

const heading = {
  color: '#1a202c',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  marginBottom: '24px',
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
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '16px 0',
  marginTop: '32px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};

const socialLink = {
    color: '#5A31F4',
    textDecoration: 'underline',
    margin: '0 8px',
    fontSize: '14px',
};

const dot = {
    color: '#a0aec0',
    margin: '0 4px',
}
