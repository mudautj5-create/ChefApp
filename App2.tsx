import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// ---------------------------------------------------------------------------
// Chef's Menu Manager
// Part 2: Add & View menu items only (no edit / delete / search / filter / stats)
// ---------------------------------------------------------------------------

const COURSES = ['Starters', 'Mains', 'Desserts', 'Beverages'];

const COLORS = {
  header: '#3A2020',      // dark maroon header
  gold: '#B8860B',        // gold accent
  goldDark: '#96690A',
  background: '#F5F0E6',  // cream background
  cardBorder: '#E3D9C6',
  cardBg: '#FBF8F2',
  text: '#2B1E14',
  subtext: '#8A6D3B',
  danger: '#B33A3A',
  placeholder: '#A99A82',
  white: '#FFFFFF',
};

export default function App() {
  // "list" or "add"
  const [screen, setScreen] = useState('list');
  const [menuItems, setMenuItems] = useState([]);

  // form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [coursePickerVisible, setCoursePickerVisible] = useState(false);

  // validation errors
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setName('');
    setDescription('');
    setCourse('');
    setPrice('');
    setImageUri(null);
    setErrors({});
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Please allow photo library access so you can attach a picture of the dish.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const goToAdd = () => {
    resetForm();
    setScreen('add');
  };

  const goToList = () => {
    setScreen('list');
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Dish name is required.';
    }
    if (!description.trim()) {
      newErrors.description = 'Please enter a short description.';
    }
    if (!course) {
      newErrors.course = 'Please select a course.';
    }
    if (!price.trim()) {
      newErrors.price = 'Price is required.';
    } else {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        newErrors.price = 'Enter a valid price greater than 0.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDish = () => {
    if (!validate()) {
      return;
    }

    const newDish = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      course,
      price: Number(price).toFixed(2),
      imageUri,
    };

    setMenuItems((prev) => [newDish, ...prev]);

    Alert.alert('Dish Added', `"${newDish.name}" was added to the menu.`, [
      { text: 'OK', onPress: goToList },
    ]);

    resetForm();
  };

  // -------------------------------------------------------------------------
  // Render: Header (shared across screens)
  // -------------------------------------------------------------------------
  const renderHeader = (title, subtitle, showBack) => (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {showBack ? (
          <TouchableOpacity onPress={goToList} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'\u2190'} Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🍴</Text>
          </View>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        {showBack ? <View style={styles.backSpacer} /> : <View style={styles.backSpacer} />}
      </View>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );

  // -------------------------------------------------------------------------
  // Render: Menu list item
  // -------------------------------------------------------------------------
  const renderMenuItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardCourse}>{item.course}</Text>
        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImagePlaceholderText}>🍽️</Text>
        </View>
      )}
      <Text style={styles.cardPrice}>R{item.price}</Text>
    </View>
  );

  // -------------------------------------------------------------------------
  // Screen: List
  // -------------------------------------------------------------------------
  const renderListScreen = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />
      {renderHeader("Christoffel's", null, false)}

      <View style={styles.listContainer}>
        {menuItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🍽️</Text>
            <Text style={styles.emptyStateTitle}>No dishes yet</Text>
            <Text style={styles.emptyStateText}>
              Your menu is empty. Tap "Add New Dish" below to add your first item.
            </Text>
          </View>
        ) : (
          <FlatList
            data={menuItems}
            keyExtractor={(item) => item.id}
            renderItem={renderMenuItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={goToAdd} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>＋  Add New Dish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // -------------------------------------------------------------------------
  // Screen: Add Dish
  // -------------------------------------------------------------------------
  const renderAddScreen = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />
      {renderHeader("Christoffel's", 'ADD NEW DISH', true)}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo */}
          <Text style={styles.label}>Photo</Text>
          <TouchableOpacity
            style={styles.photoPicker}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderIcon}>📷</Text>
                <Text style={styles.photoPlaceholderText}>Tap to choose a photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUri ? (
            <TouchableOpacity onPress={() => setImageUri(null)}>
              <Text style={styles.removePhotoText}>Remove photo</Text>
            </TouchableOpacity>
          ) : null}

          {/* Dish Name */}
          <Text style={styles.label}>Dish Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g. Traditional Bobotie"
            placeholderTextColor={COLORS.placeholder}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((e) => ({ ...e, name: null }));
            }}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            placeholder="Enter a short description of the dish..."
            placeholderTextColor={COLORS.placeholder}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors((e) => ({ ...e, description: null }));
            }}
            multiline
            numberOfLines={4}
          />
          {errors.description ? (
            <Text style={styles.errorText}>{errors.description}</Text>
          ) : null}

          {/* Course */}
          <Text style={styles.label}>Course</Text>
          <TouchableOpacity
            style={[styles.input, styles.selectInput, errors.course && styles.inputError]}
            onPress={() => setCoursePickerVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={course ? styles.selectValue : styles.selectPlaceholder}>
              {course || 'Select a course'}
            </Text>
            <Text style={styles.selectChevron}>▾</Text>
          </TouchableOpacity>
          {errors.course ? <Text style={styles.errorText}>{errors.course}</Text> : null}

          {/* Price */}
          <Text style={styles.label}>Price (R)</Text>
          <TextInput
            style={[styles.input, errors.price && styles.inputError]}
            placeholder="e.g. 145.00"
            placeholderTextColor={COLORS.placeholder}
            value={price}
            onChangeText={(text) => {
              setPrice(text);
              if (errors.price) setErrors((e) => ({ ...e, price: null }));
            }}
            keyboardType="decimal-pad"
          />
          {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveDish} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Save Dish</Text>
        </TouchableOpacity>
      </View>

      {/* Course picker modal (simple dropdown, no external dependency) */}
      <Modal
        visible={coursePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCoursePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCoursePickerVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select a Course</Text>
            {COURSES.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.modalOption}
                onPress={() => {
                  setCourse(c);
                  setErrors((e) => ({ ...e, course: null }));
                  setCoursePickerVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{c}</Text>
                {course === c ? <Text style={styles.modalCheck}>✓</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );

  return screen === 'list' ? renderListScreen() : renderAddScreen();
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.header,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backButtonText: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '600',
  },
  backSpacer: {
    width: 34,
  },
  headerTitle: {
    color: COLORS.gold,
    fontSize: 20,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  headerSubtitle: {
    color: '#D8C9AE',
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  listContent: {
    paddingBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  cardAccent: {
    width: 4,
    backgroundColor: COLORS.gold,
  },
  cardBody: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardCourse: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '600',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    paddingRight: 14,
    paddingLeft: 10,
    alignSelf: 'center',
  },
  cardImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignSelf: 'center',
    marginRight: 4,
  },
  cardImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginRight: 4,
  },
  cardImagePlaceholderText: {
    fontSize: 20,
  },
  photoPicker: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  photoPlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: COLORS.subtext,
  },
  removePhotoText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.background,
  },
  primaryButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  selectPlaceholder: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
  selectChevron: {
    color: COLORS.subtext,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.subtext,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  modalOptionText: {
    fontSize: 15,
    color: COLORS.text,
  },
  modalCheck: {
    color: COLORS.gold,
    fontWeight: '700',
  },
});

