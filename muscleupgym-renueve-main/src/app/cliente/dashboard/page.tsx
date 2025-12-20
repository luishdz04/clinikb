'use client';

import { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Row, Col, Card, Statistic, Typography, Tag, Avatar, Skeleton, Divider, Button, Modal, Input, App } from 'antd';
import { LockOutlined, ReloadOutlined, CameraOutlined, UploadOutlined } from '@ant-design/icons';
import {
  CalendarOutlined,
  CreditCardOutlined,
  UserOutlined,
  TrophyOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  HeartOutlined,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  AimOutlined,
  FileTextOutlined,
  PictureOutlined,
  EditOutlined,
  DownloadOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  IdcardOutlined,
  ScanOutlined,
  WalletOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { colors } from '@/theme';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

const { Title, Text } = Typography;

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string;
  birth_date: string;
  gender: string;
  marital_status: string;
  is_minor: boolean;
  profile_picture_url: string | null;
  contract_pdf_url: string | null;
  signature_url: string | null;
  tutor_id_url: string | null;
  address_street: string;
  address_number: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_postal_code: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_condition: string;
  blood_type: string;
  referred_by: string;
  main_motivation: string;
  receive_plans: boolean;
  training_level: string;
  rol: string;
  fingerprint: boolean;
  points_balance: number;
  membership_type: string | null;
  created_at: string;
}

const genderLabels: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
};

const maritalStatusLabels: Record<string, string> = {
  single: 'Soltero/a',
  married: 'Casado/a',
  divorced: 'Divorciado/a',
  widowed: 'Viudo/a',
};

const referredByLabels: Record<string, string> = {
  friend_family: 'Amigo/Familiar',
  social_media: 'Redes Sociales',
  google: 'Google',
  advertisement: 'Publicidad',
  other: 'Otro',
};

const motivationLabels: Record<string, string> = {
  weight_loss: 'Pérdida de peso',
  muscle_gain: 'Ganar músculo',
  health: 'Mejorar salud',
  fitness: 'Mantenerse en forma',
  stress_relief: 'Reducir estrés',
  other: 'Otro',
};

const trainingLevelLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

interface Wallet {
  id: string;
  customer_id: string;
  balance: number;
  is_active: boolean;
  notes: string | null;
}

interface FingerprintTemplate {
  id: string;
  user_id: string;
  finger_name: string;
  finger_index: number;
  average_quality: number;
  enrolled_at: string;
}

interface UserMembership {
  id: string;
  user_id: string;
  plan_id: string;
  payment_type: string;
  status: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  plan_name?: string;
}

export default function ClienteDashboard() {
  const { message } = App.useApp();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [fingerprintData, setFingerprintData] = useState<FingerprintTemplate | null>(null);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para el modal de firma
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signaturePassword, setSignaturePassword] = useState('');
  const [signatureUnlocked, setSignatureUnlocked] = useState(false);
  const [signatureLoading, setSignatureLoading] = useState(false);
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const signatureContainerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 400, height: 200 });
  
  // Estados para el modal de foto de perfil
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoPassword, setPhotoPassword] = useState('');
  const [photoUnlocked, setPhotoUnlocked] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Obtener perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData && !profileError) {
          setProfile(profileData);
        }

        // Obtener monedero MUP
        const { data: walletData } = await supabase
          .from('customer_wallets')
          .select('*')
          .eq('customer_id', user.id)
          .eq('is_active', true)
          .single();

        if (walletData) {
          setWallet(walletData);
        }

        // Obtener información de huella digital
        const { data: fingerprintInfo } = await supabase
          .from('fingerprint_templates')
          .select('id, user_id, finger_name, finger_index, average_quality, enrolled_at')
          .eq('user_id', user.id)
          .eq('_deleted', false)
          .order('enrolled_at', { ascending: false })
          .limit(1)
          .single();

        if (fingerprintInfo) {
          setFingerprintData(fingerprintInfo);
        }

        // Obtener membresía activa con nombre del plan
        const { data: membershipData } = await supabase
          .from('user_memberships')
          .select(`
            id, user_id, plan_id, payment_type, status, 
            start_date, end_date, total_amount,
            membership_plans!inner(name)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('_deleted', false)
          .order('end_date', { ascending: false })
          .limit(1)
          .single();

        if (membershipData) {
          setMembership({
            ...membershipData,
            plan_name: (membershipData.membership_plans as any)?.name || 'Plan desconocido'
          });
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const calculateAge = (birthDate: string) => {
    // Parsear la fecha sin conversión de zona horaria
    const [year, month, day] = birthDate.split('-').map(Number);
    const today = new Date();
    let age = today.getFullYear() - year;
    const currentMonth = today.getMonth() + 1; // getMonth() es 0-indexed
    if (currentMonth < month || (currentMonth === month && today.getDate() < day)) {
      age--;
    }
    return age;
  };

  // Formatear fecha sin conversión de zona horaria (la BD ya está en America/Monterrey)
  const formatDate = (dateString: string, options?: { long?: boolean }) => {
    if (!dateString) return 'No especificada';
    
    // Para fechas tipo "2025-12-06" o "2025-12-06T15:41:27..."
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    if (options?.long) {
      return `${day} de ${months[month - 1]} de ${year}`;
    }
    
    return `${day}/${month}/${year}`;
  };

  // Formatear fecha de vencimiento con nomenclatura especial: "04 de Enero del 2025"
  const formatExpirationDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const dayStr = day.toString().padStart(2, '0');
    return `${dayStr} de ${months[month - 1]} del ${year}`;
  };

  // Calcular días restantes de membresía
  const calculateDaysRemaining = (endDateString: string): number => {
    if (!endDateString) return 0;
    
    const datePart = endDateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const endDate = new Date(year, month - 1, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Obtener color del badge según días restantes
  const getDaysRemainingColor = (days: number): string => {
    if (days > 10) return 'success';
    if (days >= 4) return 'warning';
    return 'error';
  };

  // Funciones para el modal de firma
  const openSignatureModal = () => {
    setSignatureModalOpen(true);
    setSignaturePassword('');
    setSignatureUnlocked(false);
  };

  const closeSignatureModal = () => {
    setSignatureModalOpen(false);
    setSignaturePassword('');
    setSignatureUnlocked(false);
    sigCanvasRef.current?.clear();
  };

  const handlePasswordSubmit = () => {
    if (signaturePassword === 'MUP2025') {
      setSignatureUnlocked(true);
      message.success('Acceso concedido. Ahora puedes dibujar tu nueva firma.');
      // Actualizar dimensiones del canvas después de que se muestre
      setTimeout(() => {
        if (signatureContainerRef.current) {
          const { width } = signatureContainerRef.current.getBoundingClientRect();
          setCanvasDimensions({ width: width - 2, height: 200 });
        }
      }, 100);
    } else {
      message.error('Contraseña incorrecta');
    }
  };

  const clearSignature = () => {
    sigCanvasRef.current?.clear();
  };

  const handleSaveSignature = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      message.warning('Por favor dibuja tu firma antes de guardar');
      return;
    }

    setSignatureLoading(true);
    
    try {
      const signatureData = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
      
      const response = await fetch('/api/update-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: signatureData,
          password: signaturePassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar la firma');
      }

      // Actualizar el perfil local con la nueva URL de firma
      if (profile && result.signature_url) {
        setProfile({ ...profile, signature_url: result.signature_url });
      }

      message.success('Firma actualizada correctamente');
      closeSignatureModal();
      
    } catch (error) {
      console.error('Error:', error);
      message.error(error instanceof Error ? error.message : 'Error al guardar la firma');
    } finally {
      setSignatureLoading(false);
    }
  };

  // Funciones para el modal de foto de perfil
  const openPhotoModal = () => {
    setPhotoModalOpen(true);
    setPhotoPassword('');
    setPhotoUnlocked(false);
    setPhotoPreview(null);
    setCaptureMode(null);
  };

  const closePhotoModal = () => {
    stopCamera();
    setPhotoModalOpen(false);
    setPhotoPassword('');
    setPhotoUnlocked(false);
    setPhotoPreview(null);
    setCaptureMode(null);
  };

  const handlePhotoPasswordSubmit = () => {
    if (photoPassword === 'MUP2025') {
      setPhotoUnlocked(true);
      message.success('Acceso concedido. Selecciona cómo quieres subir tu foto.');
    } else {
      message.error('Contraseña incorrecta');
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      setStream(mediaStream);
      setCaptureMode('camera');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      message.error('No se pudo acceder a la cámara');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setPhotoPreview(dataUrl);
      stopCamera();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        message.error('Por favor selecciona un archivo de imagen');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
        setCaptureMode('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!photoPreview) {
      message.warning('Por favor captura o selecciona una foto');
      return;
    }

    setPhotoLoading(true);
    
    try {
      const response = await fetch('/api/update-profile-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: photoPreview,
          password: photoPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar la foto');
      }

      // Actualizar el perfil local con la nueva URL de foto
      if (profile && result.profile_picture_url) {
        setProfile({ ...profile, profile_picture_url: result.profile_picture_url });
      }

      message.success('Foto de perfil actualizada correctamente');
      closePhotoModal();
      
    } catch (error) {
      console.error('Error:', error);
      message.error(error instanceof Error ? error.message : 'Error al guardar la foto');
    } finally {
      setPhotoLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 2 }} />
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={8}>
            <Card><Skeleton active avatar paragraph={{ rows: 4 }} /></Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card><Skeleton active paragraph={{ rows: 8 }} /></Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <CloseCircleOutlined style={{ fontSize: 48, color: colors.state.error, marginBottom: 16 }} />
          <Title level={4} style={{ color: colors.text.primary }}>No se encontró tu perfil</Title>
          <Text style={{ color: colors.text.secondary }}>
            Por favor contacta a soporte si este problema persiste.
          </Text>
        </div>
      </Card>
    );
  }

  const fullAddress = [
    profile.address_street,
    profile.address_number ? `#${profile.address_number}` : '',
    profile.address_neighborhood,
    profile.address_city,
    profile.address_state,
  ].filter(Boolean).join(', ');

  return (
    <div>
      {/* Header del Dashboard */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: colors.text.primary }}>
          ¡Bienvenido, {profile.first_name}! 💪
        </Title>
        <Text style={{ color: colors.text.secondary }}>
          Tu información de registro en Muscle Up GYM
        </Text>
      </div>

      {/* Stats principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Membresía"
              value={membership ? membership.plan_name : 'Sin membresía'}
              prefix={membership ? 
                <CheckCircleOutlined style={{ color: colors.state.success }} /> :
                <CloseCircleOutlined style={{ color: colors.state.warning }} />
              }
              styles={{ content: { fontSize: 16, color: membership ? colors.state.success : colors.state.warning } }}
            />
            {membership && (
              <div style={{ marginTop: 8 }}>
                <Text style={{ color: colors.text.muted, fontSize: 12, display: 'block' }}>
                  Vence: {formatExpirationDate(membership.end_date)}
                </Text>
                <Tag 
                  color={getDaysRemainingColor(calculateDaysRemaining(membership.end_date))} 
                  style={{ marginTop: 4 }}
                >
                  {calculateDaysRemaining(membership.end_date) > 0 
                    ? `${calculateDaysRemaining(membership.end_date)} días restantes`
                    : 'Vencida'}
                </Tag>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Nivel de entrenamiento"
              value={trainingLevelLabels[profile.training_level] || profile.training_level}
              prefix={<TrophyOutlined style={{ color: colors.state.warning }} />}
              styles={{ content: { fontSize: 16 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tipo de sangre"
              value={profile.blood_type || 'No especificado'}
              prefix={<HeartOutlined style={{ color: colors.state.error }} />}
              styles={{ content: { fontSize: 16 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Huella registrada"
              value={fingerprintData ? fingerprintData.finger_name : (profile.fingerprint ? 'Sí' : 'Pendiente')}
              prefix={profile.fingerprint || fingerprintData ? 
                <CheckCircleOutlined style={{ color: colors.state.success }} /> :
                <CloseCircleOutlined style={{ color: colors.state.warning }} />
              }
              styles={{ content: { fontSize: 16, color: profile.fingerprint || fingerprintData ? colors.state.success : colors.state.warning } }}
            />
            {fingerprintData && (
              <Text style={{ color: colors.text.muted, fontSize: 12, display: 'block', marginTop: 4 }}>
                Calidad: {fingerprintData.average_quality}%
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Perfil y Datos personales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Card de perfil con foto */}
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {profile.profile_picture_url ? (
                <div style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%', 
                  overflow: 'hidden',
                  margin: '0 auto',
                  border: `3px solid ${colors.brand.primary}`,
                }}>
                  <img 
                    src={profile.profile_picture_url} 
                    alt="Foto de perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <Avatar
                  size={120}
                  style={{
                    backgroundColor: colors.brand.primary,
                    color: colors.text.inverse,
                    fontSize: 48,
                  }}
                >
                  {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                </Avatar>
              )}
              <Title level={3} style={{ margin: '16px 0 4px', color: colors.text.primary }}>
                {profile.first_name} {profile.last_name}
              </Title>
              <Tag color="success" style={{ marginBottom: 8 }}>
                {profile.rol === 'admin' ? 'Administrador' : 'Cliente'}
              </Tag>
              <br />
              <Tag color="blue">{trainingLevelLabels[profile.training_level] || 'Principiante'}</Tag>
            </div>

            <Divider style={{ borderColor: colors.border.light }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MailOutlined style={{ color: colors.brand.primary, fontSize: 16 }} />
                <Text style={{ color: colors.text.secondary }}>{profile.email}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <PhoneOutlined style={{ color: colors.brand.primary, fontSize: 16 }} />
                <Text style={{ color: colors.text.secondary }}>{profile.whatsapp}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CalendarOutlined style={{ color: colors.brand.primary, fontSize: 16 }} />
                <Text style={{ color: colors.text.secondary }}>
                  {calculateAge(profile.birth_date)} años ({formatDate(profile.birth_date)})
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserOutlined style={{ color: colors.brand.primary, fontSize: 16 }} />
                <Text style={{ color: colors.text.secondary }}>
                  {genderLabels[profile.gender] || profile.gender} • {maritalStatusLabels[profile.marital_status] || profile.marital_status}
                </Text>
              </div>
            </div>

            <Divider style={{ borderColor: colors.border.light }} />

            <div>
              <Text strong style={{ color: colors.text.primary, display: 'block', marginBottom: 8 }}>
                <EnvironmentOutlined style={{ marginRight: 8, color: colors.brand.primary }} />
                Dirección
              </Text>
              <Text style={{ color: colors.text.secondary }}>{fullAddress}</Text>
            </div>
          </Card>
        </Col>

        {/* Información detallada */}
        <Col xs={24} lg={16}>
          <Card title="Información Personal Completa">
            <Row gutter={[16, 16]}>
              {[
                { label: 'Nombre completo', value: `${profile.first_name} ${profile.last_name}` },
                { label: 'Correo electrónico', value: profile.email },
                { label: 'WhatsApp', value: profile.whatsapp },
                { label: 'Fecha de nacimiento', value: formatDate(profile.birth_date, { long: true }) },
                { label: 'Género', value: genderLabels[profile.gender] || profile.gender },
                { label: 'Estado civil', value: maritalStatusLabels[profile.marital_status] || profile.marital_status },
                { label: 'Miembro desde', value: formatDate(profile.created_at, { long: true }) },
                { label: '¿Es menor de edad?', value: profile.is_minor ? 'Sí' : 'No' },
              ].map((item, index) => (
                <Col xs={24} sm={12} key={index}>
                  <div style={{ 
                    padding: '12px 16px', 
                    background: colors.background.tertiary, 
                    borderRadius: 8,
                    borderLeft: `3px solid ${colors.brand.primary}`,
                  }}>
                    <Text style={{ color: colors.text.muted, fontSize: 12, display: 'block', marginBottom: 4 }}>
                      {item.label}
                    </Text>
                    <Text strong style={{ color: colors.text.primary, fontSize: 14, wordBreak: 'break-word' }}>
                      {item.value}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Contacto de emergencia */}
          <Card title="Contacto de Emergencia" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  padding: '12px 16px',
                  background: colors.background.tertiary,
                  borderRadius: 8,
                  borderLeft: `3px solid ${colors.state.error}`,
                }}>
                  <Avatar 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: colors.state.error }}
                  />
                  <div>
                    <Text style={{ color: colors.text.muted, fontSize: 12, display: 'block' }}>
                      Contacto
                    </Text>
                    <Text strong style={{ color: colors.text.primary, display: 'block' }}>
                      {profile.emergency_contact_name}
                    </Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                      <PhoneOutlined style={{ marginRight: 6 }} />
                      {profile.emergency_contact_phone}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ 
                  padding: '12px 16px',
                  background: colors.background.tertiary,
                  borderRadius: 8,
                  borderLeft: `3px solid ${profile.medical_condition === 'Ninguna' ? colors.state.success : colors.state.warning}`,
                }}>
                  <Text style={{ color: colors.text.muted, fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Condición médica
                  </Text>
                  <Tag color={profile.medical_condition === 'Ninguna' ? 'green' : 'orange'} style={{ margin: 0 }}>
                    {profile.medical_condition}
                  </Tag>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ 
                  padding: '12px 16px',
                  background: colors.background.tertiary,
                  borderRadius: 8,
                  borderLeft: `3px solid ${colors.state.error}`,
                }}>
                  <Text style={{ color: colors.text.muted, fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Tipo de sangre
                  </Text>
                  <Tag color="red" style={{ margin: 0 }}>{profile.blood_type}</Tag>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Preferencias y objetivos */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Mis Objetivos y Preferencias">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Motivación principal */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16,
                padding: 16,
                background: colors.background.tertiary,
                borderRadius: 8,
                border: `1px solid ${colors.border.light}`,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: colors.state.info,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AimOutlined style={{ fontSize: 24, color: colors.text.primary }} />
                </div>
                <div>
                  <Text style={{ color: colors.text.muted, fontSize: 12, display: 'block' }}>Motivación principal</Text>
                  <Text strong style={{ color: colors.state.infoLight, fontSize: 16 }}>
                    {motivationLabels[profile.main_motivation] || profile.main_motivation}
                  </Text>
                </div>
              </div>

              {/* Nivel de entrenamiento */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16,
                padding: 16,
                background: colors.background.tertiary,
                borderRadius: 8,
                border: `1px solid ${colors.border.light}`,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: colors.brand.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TrophyOutlined style={{ fontSize: 24, color: colors.text.inverse }} />
                </div>
                <div>
                  <Text style={{ color: colors.text.muted, fontSize: 12, display: 'block' }}>Nivel de entrenamiento</Text>
                  <Text strong style={{ color: colors.brand.primary, fontSize: 16 }}>
                    {trainingLevelLabels[profile.training_level] || profile.training_level}
                  </Text>
                </div>
              </div>

              {/* Cómo nos conoció */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16,
                padding: 16,
                background: colors.background.tertiary,
                borderRadius: 8,
                border: `1px solid ${colors.border.light}`,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: colors.background.elevated,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <TeamOutlined style={{ fontSize: 24, color: colors.text.primary }} />
                </div>
                <div>
                  <Text style={{ color: colors.text.muted, fontSize: 12, display: 'block' }}>¿Cómo nos conoció?</Text>
                  <Text strong style={{ color: colors.text.primary, fontSize: 16 }}>
                    {referredByLabels[profile.referred_by] || profile.referred_by}
                  </Text>
                </div>
              </div>

              {/* Recibir promociones */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16,
                padding: 16,
                background: colors.background.tertiary,
                borderRadius: 8,
                border: `1px solid ${colors.border.light}`,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: profile.receive_plans ? colors.state.success : colors.background.elevated,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <MailOutlined style={{ fontSize: 24, color: profile.receive_plans ? colors.text.inverse : colors.text.muted }} />
                </div>
                <div>
                  <Text style={{ color: colors.text.muted, fontSize: 12, display: 'block' }}>Recibir planes y promociones</Text>
                  <Text strong style={{ color: profile.receive_plans ? colors.state.successLight : colors.text.muted, fontSize: 16 }}>
                    {profile.receive_plans ? 'Sí, quiero recibir' : 'No, gracias'}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Estado de mi Cuenta">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  title: 'Huella digital',
                  status: profile.fingerprint || !!fingerprintData,
                  description: fingerprintData 
                    ? `${fingerprintData.finger_name} (Calidad: ${fingerprintData.average_quality}%)` 
                    : (profile.fingerprint ? 'Registrada correctamente' : 'Pendiente de registro en gimnasio'),
                  badge: null,
                  icon: <ScanOutlined />,
                },
                {
                  title: 'Membresía',
                  status: !!membership,
                  description: membership 
                    ? `${membership.plan_name} - Vence: ${formatExpirationDate(membership.end_date)}`
                    : 'Sin membresía activa',
                  badge: membership ? {
                    text: calculateDaysRemaining(membership.end_date) > 0 
                      ? `${calculateDaysRemaining(membership.end_date)} días`
                      : 'Vencida',
                    color: getDaysRemainingColor(calculateDaysRemaining(membership.end_date))
                  } : null,
                  icon: <CrownOutlined />,
                },
                ...(wallet && wallet.balance > 0 ? [{
                  title: 'Monedero MUP',
                  status: true,
                  description: `$${wallet.balance.toFixed(2)} de saldo disponible`,
                  badge: null,
                  icon: <WalletOutlined />,
                }] : []),
              ].map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: index < 2 ? `1px solid ${colors.border.light}` : 'none' }}>
                  <Avatar
                    style={{
                      backgroundColor: item.status ? colors.state.success : colors.state.warning,
                    }}
                    icon={item.icon}
                  />
                  <div style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, display: 'block' }}>{item.title}</Text>
                    <Text style={{ color: colors.text.muted, fontSize: 12 }}>{item.description}</Text>
                  </div>
                  {item.badge && (
                    <Tag color={item.badge.color}>{item.badge.text}</Tag>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Mis Documentos */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FolderOpenOutlined style={{ color: colors.brand.primary }} />
                <span>Mis Documentos</span>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              {/* Foto de Perfil */}
              <Col xs={24} sm={12} lg={8}>
                <div style={{
                  padding: 20,
                  background: colors.background.tertiary,
                  borderRadius: 12,
                  border: `1px solid ${colors.border.light}`,
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    margin: '0 auto 16px',
                    border: `3px solid ${profile.profile_picture_url ? colors.state.success : colors.border.secondary}`,
                    background: colors.background.elevated,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {profile.profile_picture_url ? (
                      <img 
                        src={profile.profile_picture_url} 
                        alt="Foto de perfil"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <PictureOutlined style={{ fontSize: 32, color: colors.text.muted }} />
                    )}
                  </div>
                  <Text strong style={{ color: colors.text.primary, display: 'block', marginBottom: 8 }}>
                    Foto de Perfil
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Tag color={profile.profile_picture_url ? 'success' : 'warning'} style={{ margin: 0 }}>
                      {profile.profile_picture_url ? 'Subida' : 'Pendiente'}
                    </Tag>
                    {profile.profile_picture_url && (
                      <div 
                        onClick={() => window.open(profile.profile_picture_url!, '_blank')}
                        style={{ 
                          padding: '4px 12px',
                          background: 'transparent',
                          border: `1px solid ${colors.border.secondary}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.brand.primary;
                          e.currentTarget.style.color = colors.brand.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.border.secondary;
                          e.currentTarget.style.color = colors.text.secondary;
                        }}
                      >
                        <EyeOutlined style={{ fontSize: 14 }} />
                        <Text style={{ color: 'inherit', fontSize: 13 }}>Ver</Text>
                      </div>
                    )}
                    <div 
                      onClick={openPhotoModal}
                      style={{ 
                        padding: '4px 12px',
                        background: 'transparent',
                        border: `1px solid ${colors.border.secondary}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = colors.state.warning;
                        e.currentTarget.style.color = colors.state.warning;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = colors.border.secondary;
                        e.currentTarget.style.color = colors.text.secondary;
                      }}
                    >
                      <ReloadOutlined style={{ fontSize: 14 }} />
                      <Text style={{ color: 'inherit', fontSize: 13 }}>Sustituir</Text>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Contrato */}
              <Col xs={24} sm={12} lg={8}>
                <div style={{
                  padding: 20,
                  background: colors.background.tertiary,
                  borderRadius: 12,
                  border: `1px solid ${colors.border.light}`,
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    margin: '0 auto 16px',
                    border: `3px solid ${profile.contract_pdf_url ? colors.state.success : colors.border.secondary}`,
                    background: profile.contract_pdf_url ? colors.state.successBg : colors.background.elevated,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FileTextOutlined style={{ 
                      fontSize: 36, 
                      color: profile.contract_pdf_url ? colors.state.success : colors.text.muted 
                    }} />
                  </div>
                  <Text strong style={{ color: colors.text.primary, display: 'block', marginBottom: 8 }}>
                    Contrato de Membresía
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Tag color={profile.contract_pdf_url ? 'success' : 'warning'} style={{ margin: 0 }}>
                      {profile.contract_pdf_url ? 'Firmado' : 'Pendiente'}
                    </Tag>
                    {profile.contract_pdf_url && (
                      <div 
                        onClick={() => window.open(profile.contract_pdf_url!, '_blank')}
                        style={{ 
                          padding: '4px 12px',
                          background: 'transparent',
                          border: `1px solid ${colors.border.secondary}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.state.success;
                          e.currentTarget.style.color = colors.state.success;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.border.secondary;
                          e.currentTarget.style.color = colors.text.secondary;
                        }}
                      >
                        <DownloadOutlined style={{ fontSize: 14 }} />
                        <Text style={{ color: 'inherit', fontSize: 13 }}>Descargar</Text>
                      </div>
                    )}
                  </div>
                </div>
              </Col>

              {/* Firma */}
              <Col xs={24} sm={12} lg={8}>
                <div style={{
                  padding: 20,
                  background: colors.background.tertiary,
                  borderRadius: 12,
                  border: `1px solid ${colors.border.light}`,
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    overflow: 'hidden',
                    margin: '0 auto 16px',
                    border: `3px solid ${profile.signature_url ? colors.state.success : colors.border.secondary}`,
                    background: colors.background.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {profile.signature_url ? (
                      <img 
                        src={profile.signature_url} 
                        alt="Firma"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
                      />
                    ) : (
                      <EditOutlined style={{ fontSize: 32, color: colors.text.muted }} />
                    )}
                  </div>
                  <Text strong style={{ color: colors.text.primary, display: 'block', marginBottom: 8 }}>
                    Firma Digital
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Tag color={profile.signature_url ? 'success' : 'warning'} style={{ margin: 0 }}>
                      {profile.signature_url ? 'Registrada' : 'Pendiente'}
                    </Tag>
                    {profile.signature_url && (
                      <div 
                        onClick={() => window.open(profile.signature_url!, '_blank')}
                        style={{ 
                          padding: '4px 12px',
                          background: 'transparent',
                          border: `1px solid ${colors.border.secondary}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.brand.primary;
                          e.currentTarget.style.color = colors.brand.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.border.secondary;
                          e.currentTarget.style.color = colors.text.secondary;
                        }}
                      >
                        <EyeOutlined style={{ fontSize: 14 }} />
                        <Text style={{ color: 'inherit', fontSize: 13 }}>Ver</Text>
                      </div>
                    )}
                    <div 
                      onClick={openSignatureModal}
                      style={{ 
                        padding: '4px 12px',
                        background: 'transparent',
                        border: `1px solid ${colors.border.secondary}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = colors.state.warning;
                        e.currentTarget.style.color = colors.state.warning;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = colors.border.secondary;
                        e.currentTarget.style.color = colors.text.secondary;
                      }}
                    >
                      <ReloadOutlined style={{ fontSize: 14 }} />
                      <Text style={{ color: 'inherit', fontSize: 13 }}>Sustituir</Text>
                    </div>
                  </div>
                </div>
              </Col>

              {/* INE del Tutor - Solo si es menor de edad */}
              {profile.is_minor && (
                <Col xs={24} sm={12} lg={8}>
                  <div style={{
                    padding: 20,
                    background: colors.background.tertiary,
                    borderRadius: 12,
                    border: `1px solid ${profile.tutor_id_url ? colors.state.info : colors.border.light}`,
                    textAlign: 'center',
                  }}>
                    <div style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      overflow: 'hidden',
                      margin: '0 auto 16px',
                      border: `3px solid ${profile.tutor_id_url ? colors.state.info : colors.border.secondary}`,
                      background: colors.background.elevated,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {profile.tutor_id_url ? (
                        <img 
                          src={profile.tutor_id_url} 
                          alt="INE del Tutor"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <IdcardOutlined style={{ fontSize: 32, color: colors.text.muted }} />
                      )}
                    </div>
                    <Text strong style={{ color: colors.text.primary, display: 'block', marginBottom: 8 }}>
                      INE del Tutor
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      <Tag color={profile.tutor_id_url ? 'blue' : 'warning'} style={{ margin: 0 }}>
                        {profile.tutor_id_url ? 'Registrado' : 'Pendiente'}
                      </Tag>
                      {profile.tutor_id_url && (
                        <div 
                          onClick={() => window.open(profile.tutor_id_url!, '_blank')}
                          style={{ 
                            padding: '4px 12px',
                            background: 'transparent',
                            border: `1px solid ${colors.border.secondary}`,
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.state.info;
                            e.currentTarget.style.color = colors.state.info;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = colors.border.secondary;
                            e.currentTarget.style.color = colors.text.secondary;
                          }}
                        >
                          <EyeOutlined style={{ fontSize: 14 }} />
                          <Text style={{ color: 'inherit', fontSize: 13 }}>Ver</Text>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Modal para sustituir firma */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LockOutlined style={{ color: colors.brand.primary }} />
            <span>Sustituir Firma Digital</span>
          </div>
        }
        open={signatureModalOpen}
        onCancel={closeSignatureModal}
        footer={null}
        width={500}
        destroyOnHidden
        style={{ top: 50 }}
        className="signature-modal"
      >
        {!signatureUnlocked ? (
          // Paso 1: Ingresar contraseña
          <div style={{ textAlign: 'center' }}>
            <LockOutlined style={{ fontSize: 48, color: colors.text.muted, marginBottom: 16 }} />
            <Title level={5} style={{ color: colors.text.primary, marginBottom: 8 }}>
              Acceso Restringido
            </Title>
            <Text style={{ color: colors.text.secondary, display: 'block', marginBottom: 24 }}>
              Para modificar tu firma necesitas una contraseña de autorización.
              Solicítala al personal de Muscle Up GYM.
            </Text>
            <Input.Password
              placeholder="Ingresa la contraseña"
              value={signaturePassword}
              onChange={(e) => setSignaturePassword(e.target.value)}
              onPressEnter={handlePasswordSubmit}
              style={{ 
                marginBottom: 16,
                background: colors.background.tertiary,
                borderColor: colors.border.light
              }}
              size="large"
            />
            <Button
              type="primary"
              block
              size="large"
              onClick={handlePasswordSubmit}
              style={{ 
                background: colors.brand.primary, 
                borderColor: colors.brand.primary,
                color: colors.text.inverse
              }}
            >
              Verificar
            </Button>
          </div>
        ) : (
          // Paso 2: Dibujar nueva firma
          <div>
            <Text style={{ color: colors.text.secondary, display: 'block', marginBottom: 16 }}>
              Dibuja tu nueva firma en el recuadro blanco. Esta reemplazará tu firma actual.
            </Text>
            
            <div 
              ref={signatureContainerRef}
              style={{ 
                border: `2px solid ${colors.border.light}`,
                borderRadius: 8,
                overflow: 'hidden',
                background: colors.background.white,
                position: 'relative',
                marginBottom: 16
              }}
            >
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="black"
                canvasProps={{
                  width: canvasDimensions.width,
                  height: canvasDimensions.height,
                  className: 'cursor-crosshair',
                  style: { display: 'block' }
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 30,
                left: '12.5%',
                right: '12.5%',
                height: 1,
                background: '#ddd'
              }} />
              <button
                type="button"
                onClick={clearSignature}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  padding: '4px 12px',
                  background: 'rgba(0,0,0,0.05)',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#666'
                }}
              >
                Borrar
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                block
                size="large"
                onClick={closeSignatureModal}
                style={{
                  borderColor: colors.border.secondary,
                  color: colors.text.secondary
                }}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                block
                size="large"
                loading={signatureLoading}
                onClick={handleSaveSignature}
                style={{ 
                  background: colors.brand.primary, 
                  borderColor: colors.brand.primary,
                  color: colors.text.inverse
                }}
              >
                Guardar Firma
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para sustituir foto de perfil */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CameraOutlined style={{ color: colors.brand.primary }} />
            <span>Sustituir Foto de Perfil</span>
          </div>
        }
        open={photoModalOpen}
        onCancel={closePhotoModal}
        footer={null}
        width={500}
        destroyOnHidden
        style={{ top: 50 }}
      >
        {!photoUnlocked ? (
          // Paso 1: Ingresar contraseña
          <div style={{ textAlign: 'center' }}>
            <LockOutlined style={{ fontSize: 48, color: colors.text.muted, marginBottom: 16 }} />
            <Title level={5} style={{ color: colors.text.primary, marginBottom: 8 }}>
              Acceso Restringido
            </Title>
            <Text style={{ color: colors.text.secondary, display: 'block', marginBottom: 24 }}>
              Para modificar tu foto de perfil necesitas una contraseña de autorización.
              Solicítala al personal de Muscle Up GYM.
            </Text>
            <Input.Password
              placeholder="Ingresa la contraseña"
              value={photoPassword}
              onChange={(e) => setPhotoPassword(e.target.value)}
              onPressEnter={handlePhotoPasswordSubmit}
              style={{ 
                marginBottom: 16,
                background: colors.background.tertiary,
                borderColor: colors.border.light
              }}
              size="large"
            />
            <Button
              type="primary"
              block
              size="large"
              onClick={handlePhotoPasswordSubmit}
              style={{ 
                background: colors.brand.primary, 
                borderColor: colors.brand.primary,
                color: colors.text.inverse
              }}
            >
              Verificar
            </Button>
          </div>
        ) : !photoPreview ? (
          // Paso 2: Seleccionar método de captura
          <div>
            {captureMode === 'camera' && stream ? (
              // Vista de cámara
              <div style={{ textAlign: 'center' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ 
                    width: '100%', 
                    maxHeight: 300, 
                    borderRadius: 8, 
                    marginBottom: 16,
                    background: '#000'
                  }}
                />
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button
                    block
                    size="large"
                    onClick={() => {
                      stopCamera();
                      setCaptureMode(null);
                    }}
                    style={{
                      borderColor: colors.border.secondary,
                      color: colors.text.secondary
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={capturePhoto}
                    icon={<CameraOutlined />}
                    style={{ 
                      background: colors.brand.primary, 
                      borderColor: colors.brand.primary,
                      color: colors.text.inverse
                    }}
                  >
                    Capturar
                  </Button>
                </div>
              </div>
            ) : (
              // Opciones de captura
              <div style={{ textAlign: 'center' }}>
                <Text style={{ color: colors.text.secondary, display: 'block', marginBottom: 24 }}>
                  Elige cómo quieres subir tu nueva foto de perfil:
                </Text>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                  <div
                    onClick={startCamera}
                    style={{
                      padding: 24,
                      border: `2px dashed ${colors.border.light}`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      flex: 1,
                      maxWidth: 180,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.brand.primary;
                      e.currentTarget.style.background = colors.background.tertiary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border.light;
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <CameraOutlined style={{ fontSize: 40, color: colors.brand.primary, marginBottom: 8 }} />
                    <Text style={{ color: colors.text.primary, display: 'block', fontWeight: 500 }}>
                      Tomar Foto
                    </Text>
                    <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                      Usa tu cámara
                    </Text>
                  </div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: 24,
                      border: `2px dashed ${colors.border.light}`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      flex: 1,
                      maxWidth: 180,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.brand.primary;
                      e.currentTarget.style.background = colors.background.tertiary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border.light;
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <UploadOutlined style={{ fontSize: 40, color: colors.brand.primary, marginBottom: 8 }} />
                    <Text style={{ color: colors.text.primary, display: 'block', fontWeight: 500 }}>
                      Subir Archivo
                    </Text>
                    <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                      Desde tu dispositivo
                    </Text>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <Button
                  block
                  size="large"
                  onClick={closePhotoModal}
                  style={{
                    marginTop: 24,
                    borderColor: colors.border.secondary,
                    color: colors.text.secondary
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Paso 3: Previsualizar y confirmar
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              overflow: 'hidden',
              margin: '0 auto 16px',
              border: `4px solid ${colors.brand.primary}`,
            }}>
              <img 
                src={photoPreview} 
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <Text style={{ color: colors.text.secondary, display: 'block', marginBottom: 16 }}>
              ¿Te gusta cómo se ve? Esta será tu nueva foto de perfil.
            </Text>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                block
                size="large"
                onClick={() => {
                  setPhotoPreview(null);
                  setCaptureMode(null);
                }}
                style={{
                  borderColor: colors.border.secondary,
                  color: colors.text.secondary
                }}
              >
                Cambiar
              </Button>
              <Button
                type="primary"
                block
                size="large"
                loading={photoLoading}
                onClick={handleSavePhoto}
                style={{ 
                  background: colors.brand.primary, 
                  borderColor: colors.brand.primary,
                  color: colors.text.inverse
                }}
              >
                Guardar Foto
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
