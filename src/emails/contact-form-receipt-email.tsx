
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

interface ContactFormReceiptEmailProps {
  name: string;
}

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


export default function ContactFormReceiptEmail({ name }: ContactFormReceiptEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <Html>
      <Head />
      <Preview>We've received your message - Falcon Estates</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <FalconLogo />
            <Heading style={heading}>Thank You, {name}!</Heading>
            <Text style={paragraph}>
              We have successfully received your message. Our team will review your inquiry and get back to you as soon as possible.
            </Text>
             <Text style={paragraph}>
                While you wait, feel free to explore our latest properties.
            </Text>
            <Button style={button} href={`${baseUrl}/properties`}>
              Explore Properties
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
