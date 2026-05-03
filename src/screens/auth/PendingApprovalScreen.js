import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function PendingApprovalScreen({ navigation, route }) {

  const user = route?.params?.user;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Background Circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        {/* Logo */}
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>Approval Required</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Your clergy account has been created successfully.
        </Text>

        {/* Status Card */}
        <View style={styles.card}>

          <Text style={styles.statusIcon}>⏳</Text>

          <Text style={styles.statusTitle}>
            Waiting for Administrator Approval
          </Text>

          <Text style={styles.message}>
            A diocesan administrator must review and approve your clergy
            account before you can access the platform.
          </Text>

          {user?.email && (
            <Text style={styles.email}>
              Account: {user.email}
            </Text>
          )}

          <Text style={styles.smallText}>
            You will be able to sign in once your account has been approved.
          </Text>

        </View>

        {/* Back to Login */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.loginButtonText}>
            Return to Login
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Diocese of Oke-Osun · Anglican Communion
        </Text>

      </ScrollView>
    </View>
  );
}