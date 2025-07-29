import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CalculatorState, AppSettings } from '../types/types';

const { width, height } = Dimensions.get('window');

interface Props {
  onSecretAccess: () => void;
  settings: AppSettings;
}

export const CalculatorScreen: React.FC<Props> = ({ onSecretAccess, settings }) => {
  const [calc, setCalc] = useState<CalculatorState>({
    display: '0',
    history: [],
    isResultShown: false,
  });

  const [secretSequence, setSecretSequence] = useState<string[]>([]);
  const SECRET_CODE = ['=', '=', '√', 'C']; // Secret sequence to access AI mode

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);

  const handlePress = (value: string) => {
    if (!settings.silentMode) {
      Vibration.vibrate(10); // Very subtle vibration
    }

    // Check for secret sequence
    const newSequence = [...secretSequence, value].slice(-4);
    setSecretSequence(newSequence);

    if (JSON.stringify(newSequence) === JSON.stringify(SECRET_CODE)) {
      setSecretSequence([]);
      onSecretAccess();
      return;
    }

    // Normal calculator logic
    if (value === 'C') {
      setCalc({ display: '0', history: [], isResultShown: false });
    } else if (value === '⌫') {
      if (calc.display.length > 1) {
        setCalc(prev => ({ ...prev, display: prev.display.slice(0, -1) }));
      } else {
        setCalc(prev => ({ ...prev, display: '0' }));
      }
    } else if (value === '=') {
      try {
        const result = eval(calc.display.replace(/×/g, '*').replace(/÷/g, '/'));
        const resultStr = result.toString();
        setCalc(prev => ({
          display: resultStr,
          history: [...prev.history, `${prev.display} = ${resultStr}`],
          isResultShown: true,
        }));
      } catch {
        setCalc(prev => ({ ...prev, display: 'Error' }));
      }
    } else if (['√', 'x²', '%'].includes(value)) {
      handleSpecialOperations(value);
    } else {
      if (calc.isResultShown && !isNaN(Number(value))) {
        setCalc({ display: value, history: calc.history, isResultShown: false });
      } else {
        const newDisplay = calc.display === '0' ? value : calc.display + value;
        setCalc(prev => ({ ...prev, display: newDisplay, isResultShown: false }));
      }
    }
  };

  const handleSpecialOperations = (operation: string) => {
    try {
      const current = parseFloat(calc.display);
      let result: number;

      switch (operation) {
        case '√':
          result = Math.sqrt(current);
          break;
        case 'x²':
          result = current * current;
          break;
        case '%':
          result = current / 100;
          break;
        default:
          return;
      }

      const resultStr = result.toString();
      setCalc(prev => ({
        display: resultStr,
        history: [...prev.history, `${operation}(${current}) = ${resultStr}`],
        isResultShown: true,
      }));
    } catch {
      setCalc(prev => ({ ...prev, display: 'Error' }));
    }
  };

  const Button: React.FC<{
    title: string;
    onPress: () => void;
    type?: 'number' | 'operator' | 'action' | 'equals';
    flex?: number;
  }> = ({ title, onPress, type = 'number', flex = 1 }) => {
    const getButtonStyle = () => {
      switch (type) {
        case 'operator':
          return [styles.button, styles.operatorButton];
        case 'action':
          return [styles.button, styles.actionButton];
        case 'equals':
          return [styles.button, styles.equalsButton];
        default:
          return [styles.button, styles.numberButton];
      }
    };

    const getTextColor = () => {
      switch (type) {
        case 'operator':
        case 'action':
          return '#fff';
        case 'equals':
          return '#fff';
        default:
          return '#333';
      }
    };

    return (
      <TouchableOpacity
        style={[...getButtonStyle(), { flex }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { color: getTextColor() }]}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="calculator" size={24} color="#333" />
        <Text style={styles.headerTitle}>Calculator</Text>
      </View>

      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>
          {calc.display}
        </Text>
        {calc.history.length > 0 && (
          <Text style={styles.history} numberOfLines={1}>
            {calc.history[calc.history.length - 1]}
          </Text>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Row 1 */}
        <View style={styles.row}>
          <Button title="C" onPress={() => handlePress('C')} type="action" />
          <Button title="⌫" onPress={() => handlePress('⌫')} type="action" />
          <Button title="%" onPress={() => handlePress('%')} type="operator" />
          <Button title="÷" onPress={() => handlePress('÷')} type="operator" />
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <Button title="7" onPress={() => handlePress('7')} />
          <Button title="8" onPress={() => handlePress('8')} />
          <Button title="9" onPress={() => handlePress('9')} />
          <Button title="×" onPress={() => handlePress('×')} type="operator" />
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <Button title="4" onPress={() => handlePress('4')} />
          <Button title="5" onPress={() => handlePress('5')} />
          <Button title="6" onPress={() => handlePress('6')} />
          <Button title="-" onPress={() => handlePress('-')} type="operator" />
        </View>

        {/* Row 4 */}
        <View style={styles.row}>
          <Button title="1" onPress={() => handlePress('1')} />
          <Button title="2" onPress={() => handlePress('2')} />
          <Button title="3" onPress={() => handlePress('3')} />
          <Button title="+" onPress={() => handlePress('+')} type="operator" />
        </View>

        {/* Row 5 */}
        <View style={styles.row}>
          <Button title="√" onPress={() => handlePress('√')} type="action" />
          <Button title="0" onPress={() => handlePress('0')} />
          <Button title="." onPress={() => handlePress('.')} />
          <Button title="=" onPress={() => handlePress('=')} type="equals" />
        </View>

        {/* Row 6 - Extra functions */}
        <View style={styles.row}>
          <Button title="x²" onPress={() => handlePress('x²')} type="action" flex={2} />
          <Button title="(" onPress={() => handlePress('(')} type="operator" />
          <Button title=")" onPress={() => handlePress(')')} type="operator" />
        </View>
      </View>

      {/* Secret indicator (very subtle) */}
      {secretSequence.length > 0 && (
        <View style={styles.secretIndicator}>
          {secretSequence.map((_, index) => (
            <View key={index} style={styles.secretDot} />
          ))}
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  display: {
    fontSize: 48,
    fontWeight: '300',
    color: '#333',
    textAlign: 'right',
    marginBottom: 10,
  },
  history: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    opacity: 0.7,
  },
  buttonsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    height: 70,
    margin: 5,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  numberButton: {
    backgroundColor: '#fff',
  },
  operatorButton: {
    backgroundColor: '#007AFF',
  },
  actionButton: {
    backgroundColor: '#FF9500',
  },
  equalsButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '400',
  },
  secretIndicator: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    flexDirection: 'row',
  },
  secretDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#007AFF',
    marginRight: 3,
    opacity: 0.3,
  },
});