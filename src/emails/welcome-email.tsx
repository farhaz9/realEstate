
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

interface WelcomeEmailProps {
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

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <Html>
      <Head />
      <Preview>Welcome to Falcon Estates! Your journey begins now.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <FalconLogo />
            <Heading style={heading}>Welcome to the Nest, {name}!</Heading>
            <Text style={paragraph}>
              We are thrilled to have you join the Falcon Estates community. You're one step closer to finding your dream property or connecting with top-tier real estate professionals.
            </Text>
            
            <Section style={highlightSection}>
                <Text style={highlightText}>
                    As a new member, you've received <strong>1 free property listing credit</strong> to get you started.
                </Text>
            </Section>

            <Button style={button} href={`${baseUrl}/add-property`}>
              List Your Property Now
            </Button>
            
            <Text style={paragraphSmall}>
                Alternatively, you can start by exploring properties on our platform.
            </Text>
            <Link href={`${baseUrl}/properties`} style={link}>
                Browse Properties
            </Link>

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
  marginBottom: '24px',
};

const paragraphSmall = {
  ...paragraph,
  fontSize: '14px',
  marginTop: '16px',
  marginBottom: '8px',
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
  marginTop: '24px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};

const link = {
  color: '#5A31F4',
  textDecoration: 'underline',
  textAlign: 'center' as const,
  display: 'block',
  fontSize: '14px',
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
};

const highlightSection = {
    backgroundColor: '#f7f3ff',
    borderLeft: '4px solid #5A31F4',
    padding: '16px',
    borderRadius: '4px',
    textAlign: 'center' as const,
    marginBottom: '24px',
};

const highlightText = {
    color: '#5A31F4',
    fontSize: '16px',
    lineHeight: '24px',
    margin: 0,
};
