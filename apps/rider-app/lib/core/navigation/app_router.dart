// Solo Advertiser — Rider App
// GoRouter configuration with authentication guards
// Defines all application routes and navigation structure

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth/auth_provider.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/otp_screen.dart';
import '../../features/onboarding/screens/welcome_screen.dart';
import '../../features/onboarding/screens/personal_info_screen.dart';
import '../../features/onboarding/screens/vehicle_screen.dart';
import '../../features/onboarding/screens/document_upload_screen.dart';
import '../../features/onboarding/screens/zone_selection_screen.dart';
import '../../features/onboarding/screens/completion_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/home/screens/notification_center_screen.dart';
import '../../features/home/screens/verification_capture_screen.dart';
import '../../features/campaigns/screens/campaign_list_screen.dart';
import '../../features/campaigns/screens/campaign_detail_screen.dart';
import '../../features/earnings/screens/earnings_screen.dart';
import '../../features/earnings/screens/payout_history_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/profile/screens/edit_personal_info_screen.dart';
import '../../features/profile/screens/vehicle_details_screen.dart';
import '../../features/profile/screens/documents_screen.dart';
import '../../features/profile/screens/support_screen.dart';
import '../../features/profile/screens/support_conversation_screen.dart';
import '../../features/profile/screens/settings_screen.dart';

/// Route path constants
class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const otp = '/otp';
  static const welcome = '/onboarding/welcome';
  static const personalInfo = '/onboarding/personal-info';
  static const vehicle = '/onboarding/vehicle';
  static const documentUpload = '/onboarding/documents';
  static const zoneSelection = '/onboarding/zone';
  static const onboardingComplete = '/onboarding/complete';
  static const home = '/home';
  static const notifications = '/notifications';
  static const verification = '/verification';
  static const campaigns = '/campaigns';
  static const campaignDetail = '/campaigns/:id';
  static const earnings = '/earnings';
  static const payoutHistory = '/earnings/payouts';
  static const profile = '/profile';
  static const editPersonalInfo = '/profile/edit';
  static const vehicleDetails = '/profile/vehicle';
  static const documents = '/profile/documents';
  static const support = '/support';
  static const supportConversation = '/support/:ticketId';
  static const settings = '/settings';
}

/// Router factory using Riverpod ref for auth state access
class AppRouter {
  static GoRouter createRouter(Ref ref) {
    return GoRouter(
      initialLocation: AppRoutes.splash,
      redirect: (context, state) {
        final auth = ref.read(authProvider);
        final isOnAuthPage = state.matchedLocation == AppRoutes.login ||
            state.matchedLocation == AppRoutes.otp;

        if (auth.status == AuthStatus.unauthenticated && !isOnAuthPage) {
          return AppRoutes.login;
        }
        if (auth.status == AuthStatus.authenticated && isOnAuthPage) {
          return AppRoutes.home;
        }
        return null;
      },
      routes: [
        GoRoute(path: AppRoutes.splash, builder: (_, __) => const SplashScreen()),
        GoRoute(path: AppRoutes.login, builder: (_, __) => const LoginScreen()),
        GoRoute(path: AppRoutes.otp, builder: (_, state) => OtpScreen(phone: state.extra as String)),
        GoRoute(path: AppRoutes.welcome, builder: (_, __) => const WelcomeScreen()),
        GoRoute(path: AppRoutes.personalInfo, builder: (_, __) => const PersonalInfoScreen()),
        GoRoute(path: AppRoutes.vehicle, builder: (_, __) => const VehicleScreen()),
        GoRoute(path: AppRoutes.documentUpload, builder: (_, __) => const DocumentUploadScreen()),
        GoRoute(path: AppRoutes.zoneSelection, builder: (_, __) => const ZoneSelectionScreen()),
        GoRoute(path: AppRoutes.onboardingComplete, builder: (_, __) => const CompletionScreen()),
        GoRoute(path: AppRoutes.home, builder: (_, __) => const HomeScreen()),
        GoRoute(path: AppRoutes.notifications, builder: (_, __) => const NotificationCenterScreen()),
        GoRoute(path: AppRoutes.verification, builder: (_, __) => const VerificationCaptureScreen()),
        GoRoute(path: AppRoutes.campaigns, builder: (_, __) => const CampaignListScreen()),
        GoRoute(path: AppRoutes.campaignDetail, builder: (_, state) => CampaignDetailScreen(id: state.pathParameters['id']!)),
        GoRoute(path: AppRoutes.earnings, builder: (_, __) => const EarningsScreen()),
        GoRoute(path: AppRoutes.payoutHistory, builder: (_, __) => const PayoutHistoryScreen()),
        GoRoute(path: AppRoutes.profile, builder: (_, __) => const ProfileScreen()),
        GoRoute(path: AppRoutes.editPersonalInfo, builder: (_, __) => const EditPersonalInfoScreen()),
        GoRoute(path: AppRoutes.vehicleDetails, builder: (_, __) => const VehicleDetailsScreen()),
        GoRoute(path: AppRoutes.documents, builder: (_, __) => const DocumentsScreen()),
        GoRoute(path: AppRoutes.support, builder: (_, __) => const SupportScreen()),
        GoRoute(path: AppRoutes.supportConversation, builder: (_, state) => SupportConversationScreen(ticketId: state.pathParameters['ticketId']!)),
        GoRoute(path: AppRoutes.settings, builder: (_, __) => const SettingsScreen()),
      ],
    );
  }
}
