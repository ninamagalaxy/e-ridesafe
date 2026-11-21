import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

const HELPER_URL = 'http://192.168.0.211:8787';
const HOTSPOTS = [
  { name: 'Main Street crossing', level: 'High', note: 'Busy crossing; watch for turning cars.' },
  { name: 'Park Avenue sidewalk', level: 'Medium', note: 'Slow down near pedestrians.' },
  { name: 'School zone', level: 'High', note: 'Use extra care during arrival and dismissal.' },
];
const SAFETY_RULES = [
  'Wear a helmet and use front and rear lights.',
  'Follow traffic signals and local e-bike rules.',
  'Never carry a second rider unless the vehicle is designed for it.',
  'Slow down around people, driveways, and intersections.',
  'Stop safely before checking a phone or reading an alert.',
];

function Card({ children, style }) { return <View style={[styles.card, style]}>{children}</View>; }
function PrimaryButton({ children, onPress, disabled }) {
  return <Pressable onPress={onPress} disabled={disabled} style={[styles.primaryButton, disabled && styles.disabledButton]}><Text style={styles.primaryButtonText}>{children}</Text></Pressable>;
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [alertStatus, setAlertStatus] = useState('Alerts are off');
  const [nearbyAlert, setNearbyAlert] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [thinking, setThinking] = useState(false);
  const locationSubscription = useRef(null);
  useEffect(() => () => locationSubscription.current?.remove(), []);

  async function enableAlerts() {
    const notificationPermission = await Notifications.requestPermissionsAsync();
    const locationPermission = await Location.requestForegroundPermissionsAsync();
    if (notificationPermission.status !== 'granted' || locationPermission.status !== 'granted') {
      setAlertStatus('Permission needed for nearby alerts');
      Alert.alert('Alerts need permission', 'Allow location and notifications, then try again. You can always follow signs and use your own judgment.');
      return;
    }
    setAlertStatus('Nearby alerts are on');
    locationSubscription.current = await Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, distanceInterval: 25 }, () => setAlertStatus('Nearby alerts are on'));
  }

  async function showDemoAlert() {
    const hotspot = HOTSPOTS[0];
    setNearbyAlert(hotspot);
    await Notifications.scheduleNotificationAsync({ content: { title: 'E-RideSafe safety reminder', body: hotspot.note }, trigger: null });
  }

  async function askAI() {
    if (!question.trim() || thinking) return;
    setThinking(true); setAnswer('');
    try {
      const response = await fetch(`${HELPER_URL}/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question.trim() }) });
      const body = await response.json();
      setAnswer(!response.ok || body.error ? (body.error?.message || 'I could not answer right now. Check Wi-Fi and make sure the helper is running.') : (body.answer || 'I do not know yet. Please check an official local safety source.'));
    } catch {
      setAnswer('I could not reach the helper. Check Wi-Fi and make sure the helper is running on the computer.');
    } finally { setThinking(false); }
  }

  function renderHome() {
    return <>
      <Card style={styles.heroCard}><Text style={styles.eyebrow}>SAFETY AND KINDNESS</Text><Text style={styles.heroTitle}>Ride smarter. Look up safely.</Text><Text style={styles.heroText}>E-RideSafe gives friendly reminders near risky places. Warnings are not guarantees—follow signs, watch the road, and use your judgment.</Text><PrimaryButton onPress={enableAlerts}>{alertStatus === 'Nearby alerts are on' ? 'Alerts are on' : 'Turn on nearby alerts'}</PrimaryButton><Text style={styles.status}>{alertStatus}</Text></Card>
      {nearbyAlert && <Card style={styles.alertCard}><Text style={styles.alertTitle}>Safety reminder near you</Text><Text style={styles.bodyText}>{nearbyAlert.note}</Text><Text style={styles.smallText}>Stop safely before reading alerts. This demo warning is not guaranteed to be accurate.</Text></Card>}
      <Card><Text style={styles.sectionTitle}>Main job: timely safety reminders</Text><Text style={styles.bodyText}>Use the demo alert to show how E-RideSafe can speak up before a risky moment. Real hotspot coordinates should come from verified community or official records.</Text><Pressable onPress={showDemoAlert} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Test a demo alert</Text></Pressable></Card>
      <Card><Text style={styles.sectionTitle}>Version 1</Text><Text style={styles.bodyText}>Hotspot map · local rules · traffic updates · emergency contacts · safe AI answers</Text></Card>
    </>;
  }

  function renderMap() {
    return <Card><Text style={styles.sectionTitle}>Community hotspot map</Text><Text style={styles.bodyText}>Demo records are shown for the video prototype. Replace them with verified local records before public testing.</Text><View style={styles.mapBox}><View style={styles.mapRoadVertical} /><View style={styles.mapRoadHorizontal} /><View style={[styles.mapPin, { top: 28, left: 74 }]}><Text style={styles.pinText}>!</Text></View><View style={[styles.mapPin, { top: 88, right: 62 }]}><Text style={styles.pinText}>!</Text></View><View style={[styles.mapPin, { bottom: 24, left: 142 }]}><Text style={styles.pinText}>!</Text></View><Text style={styles.mapLabel}>Community safety map</Text></View>{HOTSPOTS.map((hotspot) => <View key={hotspot.name} style={styles.listRow}><View style={[styles.levelDot, hotspot.level === 'High' && styles.highDot]} /><View style={styles.flex}><Text style={styles.rowTitle}>{hotspot.name}</Text><Text style={styles.smallText}>{hotspot.note}</Text></View><Text style={styles.level}>{hotspot.level}</Text></View>)}</Card>;
  }

  function renderRules() {
    return <><Card><Text style={styles.sectionTitle}>Local e-bike rules</Text><Text style={styles.bodyText}>Check your city and state rules before riding. These reminders are educational, not legal advice.</Text>{SAFETY_RULES.map((rule, index) => <View key={rule} style={styles.ruleRow}><Text style={styles.ruleNumber}>{index + 1}</Text><Text style={styles.bodyText}>{rule}</Text></View>)}</Card><Card><Text style={styles.sectionTitle}>Traffic updates</Text><Text style={styles.bodyText}>Before riding, check official city traffic advisories. E-RideSafe should not guess about a road closure or event.</Text></Card><Card><Text style={styles.sectionTitle}>Emergency contacts</Text><Text style={styles.bodyText}>For an emergency, stop safely and call local emergency services.</Text><Pressable onPress={() => Linking.openURL('tel:911')} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Call 911</Text></Pressable></Card></>;
  }

  function renderAI() {
    return <Card><Text style={styles.sectionTitle}>Ask E-RideSafe AI</Text><Text style={styles.bodyText}>Ask a short safety question. The AI uses the project safety rules and does not know your location.</Text><TextInput value={question} onChangeText={setQuestion} placeholder="Example: How can I stay visible at night?" placeholderTextColor="#708090" style={styles.input} multiline /><PrimaryButton onPress={askAI} disabled={thinking || !question.trim()}>{thinking ? 'Thinking…' : 'Ask safely'}</PrimaryButton>{answer ? <View style={styles.answerBox}><Text style={styles.answerLabel}>Answer</Text><Text style={styles.bodyText}>{answer}</Text></View> : null}</Card>;
  }

  return <SafeAreaView style={styles.safe}><StatusBar style="light" /><ScrollView contentContainerStyle={styles.container}><Text style={styles.appName}>E-RideSafe</Text><Text style={styles.subtitle}>Safer choices for every ride</Text>{screen === 'home' && renderHome()}{screen === 'map' && renderMap()}{screen === 'rules' && renderRules()}{screen === 'ai' && renderAI()}<View style={styles.nav}>{[['home', 'Home'], ['map', 'Map'], ['rules', 'Rules'], ['ai', 'Ask AI']].map(([id, label]) => <Pressable key={id} onPress={() => setScreen(id)} style={[styles.navButton, screen === id && styles.activeNav]}><Text style={[styles.navText, screen === id && styles.activeNavText]}>{label}</Text></Pressable>)}</View><Text style={styles.footer}>Warnings can be incomplete or outdated. Stop safely before using your phone.</Text></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071b2c' }, container: { padding: 20, paddingTop: 28, paddingBottom: 40 }, appName: { color: '#e5f8ff', fontSize: 34, fontWeight: '800', letterSpacing: -1 }, subtitle: { color: '#8ed9e7', fontSize: 15, marginBottom: 18 }, heroCard: { backgroundColor: '#0c6772' }, card: { backgroundColor: '#102b40', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#21465d' }, eyebrow: { color: '#b9f5dc', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 }, heroTitle: { color: '#fff', fontSize: 28, lineHeight: 32, fontWeight: '800', marginTop: 8 }, heroText: { color: '#e1fbff', fontSize: 16, lineHeight: 23, marginVertical: 14 }, sectionTitle: { color: '#f1fbff', fontSize: 20, fontWeight: '800', marginBottom: 8 }, bodyText: { color: '#c5d9e4', fontSize: 15, lineHeight: 22 }, smallText: { color: '#8eabbc', fontSize: 12, lineHeight: 18, marginTop: 5 }, status: { color: '#b9f5dc', fontSize: 13, marginTop: 10, fontWeight: '700' }, primaryButton: { backgroundColor: '#ffca63', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', marginTop: 4 }, disabledButton: { backgroundColor: '#71818a' }, primaryButtonText: { color: '#1d2b31', fontWeight: '800', fontSize: 15 }, secondaryButton: { borderColor: '#5bd4cf', borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 14 }, secondaryButtonText: { color: '#9cf5ed', fontWeight: '800' }, alertCard: { backgroundColor: '#5b3e19', borderColor: '#f2b84b' }, alertTitle: { color: '#ffd787', fontSize: 18, fontWeight: '800', marginBottom: 6 }, mapBox: { height: 190, backgroundColor: '#183e46', borderRadius: 16, marginVertical: 16, overflow: 'hidden', position: 'relative' }, mapRoadVertical: { position: 'absolute', width: 36, height: 240, backgroundColor: '#5c7a78', left: 122, top: -20, transform: [{ rotate: '18deg' }] }, mapRoadHorizontal: { position: 'absolute', width: 360, height: 30, backgroundColor: '#5c7a78', left: -20, top: 82, transform: [{ rotate: '-10deg' }] }, mapPin: { position: 'absolute', backgroundColor: '#f26b5e', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }, pinText: { color: '#fff', fontWeight: '900', fontSize: 18 }, mapLabel: { color: '#e4ffff', fontWeight: '800', position: 'absolute', bottom: 10, left: 12 }, listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#21465d' }, levelDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ffca63', marginRight: 10 }, highDot: { backgroundColor: '#f26b5e' }, flex: { flex: 1 }, rowTitle: { color: '#f1fbff', fontWeight: '800', fontSize: 15 }, level: { color: '#f7d187', fontWeight: '800' }, ruleRow: { flexDirection: 'row', gap: 10, marginTop: 15, alignItems: 'flex-start' }, ruleNumber: { color: '#74eee0', fontSize: 18, fontWeight: '800', width: 22 }, input: { backgroundColor: '#071b2c', color: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#36627a', minHeight: 84, padding: 12, textAlignVertical: 'top', marginVertical: 14 }, answerBox: { backgroundColor: '#0b3b4b', borderRadius: 14, padding: 14, marginTop: 14 }, answerLabel: { color: '#8ef0df', fontWeight: '800', marginBottom: 6 }, nav: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#102b40', padding: 6, borderRadius: 16, marginTop: 4 }, navButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 }, activeNav: { backgroundColor: '#5bd4cf' }, navText: { color: '#9ab6c5', fontWeight: '700', fontSize: 12 }, activeNavText: { color: '#062431' }, footer: { color: '#718f9f', textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 16 },
});
