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
} from '@react-email/components';

interface ContactFormEmailProps {
  name: string;
  email: string;
  message: string;
}

export default function ContactFormEmail({
  name,
  email,
  message,
}: ContactFormEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New message from your website contact form</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Heading style={heading}>New Message Received</Heading>
            <Text style={paragraph}>
              You have received a new message from your website's contact form.
            </Text>
            <Hr style={hr} />
            <Text style={paragraph}>
              <strong>From:</strong> {name}
            </Text>
            <Text style={paragraph}>
              <strong>Email:</strong> {email}
            </Text>
            <Hr style={hr} />
            <Heading as="h2" style={subHeading}>
              Message:
            </Heading>
            <Text style={messageBox}>{message}</Text>
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
};

const box = {
  padding: '0 48px',
};

const heading = {
  color: '#1a202c',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
};

const subHeading = {
    color: '#4a5568',
    fontSize: '20px',
    fontWeight: '600',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '20px 0',
};

const paragraph = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
};

const messageBox = {
    backgroundColor: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    color: '#2d3748',
    fontSize: '16px',
    lineHeight: '24px',
    whiteSpace: 'pre-wrap' as const,
}
