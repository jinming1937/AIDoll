import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useDollStore } from '../store/dollStore';

const { width } = Dimensions.get('window');
const DOLL_SIZE = width * 0.7;

interface DollCharacterProps {
  scale?: number;
}

const DollCharacter: React.FC<DollCharacterProps> = ({ scale = 1 }) => {
  const { config, currentAnimation } = useDollStore();

  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const danceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Idle animation - gentle breathing
    const idleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    idleAnimation.start();

    return () => {
      idleAnimation.stop();
    };
  }, []);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    switch (currentAnimation) {
      case 'talking':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 0.5,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'dancing':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(danceAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(danceAnim, {
              toValue: -1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(danceAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'waving':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(waveAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(waveAnim, {
              toValue: -1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(waveAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        );
        break;

      case 'happy':
        animation = Animated.sequence([
          Animated.spring(bounceAnim, {
            toValue: -20,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 0,
            friction: 3,
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'thinking':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 10,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -10,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        break;
    }

    if (animation) {
      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [currentAnimation]);

  const animatedStyle = {
    transform: [
      {
        translateY: bounceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
      {
        rotate: danceAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-10deg', '0deg', '10deg'],
        }),
      },
      {
        rotate: rotateAnim.interpolate({
          inputRange: [-10, 10],
          outputRange: ['-10deg', '10deg'],
        }),
      },
    ],
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale }] },
        animatedStyle,
      ]}
    >
      {config.imageUri ? (
        <Image
          source={{ uri: config.imageUri }}
          style={styles.dollImage}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={[styles.placeholderBody, { backgroundColor: config.outfitColor }]}>
            <View style={[styles.placeholderHead, { backgroundColor: config.skinColor }]}>
              <View style={[styles.placeholderHair, { backgroundColor: config.hairColor }]} />
              <View style={styles.eyesContainer}>
                <View style={[styles.placeholderEye, { backgroundColor: config.eyeColor }]} />
                <View style={[styles.placeholderEye, { backgroundColor: config.eyeColor }]} />
              </View>
              <View style={styles.placeholderMouth} />
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dollImage: {
    width: DOLL_SIZE,
    height: DOLL_SIZE,
    borderRadius: 20,
  },
  placeholderContainer: {
    width: DOLL_SIZE,
    height: DOLL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderBody: {
    width: DOLL_SIZE * 0.6,
    height: DOLL_SIZE * 0.8,
    borderRadius: DOLL_SIZE * 0.3,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: DOLL_SIZE * 0.1,
  },
  placeholderHead: {
    width: DOLL_SIZE * 0.5,
    height: DOLL_SIZE * 0.5,
    borderRadius: DOLL_SIZE * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  placeholderHair: {
    position: 'absolute',
    top: -DOLL_SIZE * 0.05,
    left: DOLL_SIZE * 0.05,
    right: DOLL_SIZE * 0.05,
    height: DOLL_SIZE * 0.15,
    borderRadius: DOLL_SIZE * 0.075,
  },
  eyesContainer: {
    flexDirection: 'row',
    gap: DOLL_SIZE * 0.08,
    marginTop: DOLL_SIZE * 0.05,
  },
  placeholderEye: {
    width: DOLL_SIZE * 0.08,
    height: DOLL_SIZE * 0.08,
    borderRadius: DOLL_SIZE * 0.04,
  },
  placeholderMouth: {
    width: DOLL_SIZE * 0.12,
    height: DOLL_SIZE * 0.04,
    backgroundColor: '#E07A7A',
    borderRadius: DOLL_SIZE * 0.02,
    marginTop: DOLL_SIZE * 0.08,
  },
});

export default DollCharacter;
