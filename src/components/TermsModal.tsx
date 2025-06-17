// Violet Yousif, 6/1/2025, Created a modal component for displaying terms of service and dynamic date.
// Violet Yousif, 6/13/2025, Added current date and edited last updated date to the terms of service modal.
import React from 'react';
import { Modal, Typography } from 'antd';

const { Title, Paragraph } = Typography;

interface ModalTermsProps {
  visible: boolean;
  onClose: () => void;
}

// Styles for the modal pop-up screen (react component)
const ModalTerms: React.FC<ModalTermsProps> = ({ visible, onClose }) => {
  return (
    <Modal
        title="Terms of Service"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        styles={{ 
            body: { 
                maxHeight: '70vh', 
                overflowY: 'auto', 
                padding: '12px',
                backgroundColor: '#F1F1EB',
                margin: '0 auto',
            } 
        }}
        // pushes modal closer to top (needed for when screen is minimized)
        modalRender={(modal) => (
            <div style={{ marginTop: '1vh' }}>{ modal }</div>
    )}
    >
      <Typography>
        <Title level={4}>Today's Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Title>
        <Paragraph>Last Updated: June 1, 2025</Paragraph>

        <Paragraph>
          Welcome to Methuselah, an AI-powered health and longevity platform (“the Service”). By registering or using our platform, you agree to the following terms:
        </Paragraph>

        <Title level={5}>1. Use of the Service</Title>
        <Paragraph>
          You agree to use this platform solely for personal, non-commercial purposes. The information and recommendations provided by the AI are not a substitute for professional medical advice.
        </Paragraph>

        <Title level={5}>2. User Data & Privacy</Title>
        <Paragraph>
          By using the Service, you agree that your input and AI conversations are stored and may be used to personalize responses and improve the AI. Data may also be anonymized for platform improvement.
        </Paragraph>

        <Title level={5}>3. Account Responsibility</Title>
        <Paragraph>
          You are responsible for your account activity. Notify us of any unauthorized access.
        </Paragraph>

        <Title level={5}>4. Content & Accuracy</Title>
        <Paragraph>
          The AI content is informational and may not always be accurate. Do not rely on it for serious medical decisions.
        </Paragraph>

        <Title level={5}>5. Modifications</Title>
        <Paragraph>
          We may change or suspend the Service without notice.
        </Paragraph>

        <Title level={5}>6. Limitation of Liability</Title>
        <Paragraph>
          We are not liable for damages resulting from use of the Service.
        </Paragraph>

        <Title level={5}>7. Governing Law</Title>
        <Paragraph>
          These Terms are governed by the laws of our company’s jurisdiction.
        </Paragraph>

        <Title level={5}>8. Updates</Title>
        <Paragraph>
          These Terms may change. Continued use indicates acceptance.
        </Paragraph>

        <Paragraph>
          By using this platform, you agree to the above terms.
        </Paragraph>
      </Typography>
    </Modal>
  );
};

export default ModalTerms;
