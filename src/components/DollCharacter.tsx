import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';
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
    ],
  };

  const headStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [-10, 10],
          outputRange: ['-10deg', '10deg'],
        }),
      },
    ],
  };

  const armStyle = {
    transform: [
      {
        rotate: waveAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-30deg', '0deg', '30deg'],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }, animatedStyle]}>
      <Svg width={DOLL_SIZE} height={DOLL_SIZE} viewBox="0 0 200 320">
        <Defs>
          <LinearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={config.hairColor} />
            <Stop offset="100%" stopColor={config.hairColor} stopOpacity={0.8} />
          </LinearGradient>
          <LinearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={config.skinColor} />
            <Stop offset="100%" stopColor={config.skinColor} stopOpacity={0.9} />
          </LinearGradient>
          <LinearGradient id="outfitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={config.outfitColor} />
            <Stop offset="100%" stopColor={config.outfitColor} stopOpacity={0.8} />
          </LinearGradient>
        </Defs>

        {/* Back Hair - Long wavy hair */}
        <Path
          d="M40 70 Q20 120 25 180 Q30 220 40 260 Q50 280 100 280 Q150 280 160 260 Q170 220 175 180 Q180 120 160 70"
          fill="url(#hairGradient)"
        />

        {/* Body/Qipao (Cheongsam) */}
        <Path
          d="M75 145 L60 300 Q100 315 140 300 L125 145 Z"
          fill="url(#outfitGradient)"
        />

        {/* Qipao collar (mandarin collar) */}
        <Path
          d="M85 145 L100 165 L115 145 L115 135 Q100 140 85 135 Z"
          fill={config.outfitColor}
          stroke="#8B0000"
          strokeWidth="1"
        />

        {/* Qipao frog buttons (盘扣) */}
        <Circle cx="95" cy="170" r="4" fill="#8B0000" />
        <Circle cx="95" cy="185" r="4" fill="#8B0000" />
        <Circle cx="95" cy="200" r="4" fill="#8B0000" />

        {/* Qipao side slit detail */}
        <Path
          d="M125 220 L125 280"
          stroke="#8B0000"
          strokeWidth="2"
          fill="none"
        />

        {/* Left Arm */}
        <AnimatedG>
          <Path
            d="M75 155 Q45 190 40 235"
            stroke={config.skinColor}
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx="40" cy="240" r="7" fill={config.skinColor} />
        </AnimatedG>

        {/* Right Arm */}
        <AnimatedG>
          <Path
            d="M125 155 Q155 190 160 235"
            stroke={config.skinColor}
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx="160" cy="240" r="7" fill={config.skinColor} />
        </AnimatedG>

        {/* Neck */}
        <Rect x="88" y="125" width="24" height="25" fill={config.skinColor} />

        {/* Head Group */}
        <AnimatedG>
          {/* Face - oval shape */}
          <Ellipse cx="100" cy="85" rx="50" ry="58" fill="url(#skinGradient)" />

          {/* Blush - subtle */}
          <Ellipse cx="68" cy="98" rx="10" ry="7" fill="#FFB6C1" opacity="0.5" />
          <Ellipse cx="132" cy="98" rx="10" ry="7" fill="#FFB6C1" opacity="0.5" />

          {/* Eyes - gentle almond shape */}
          <G>
            {/* Left Eye */}
            <Ellipse cx="78" cy="78" rx="11" ry="13" fill="white" />
            <Circle cx="78" cy="78" r="7" fill={config.eyeColor} />
            <Circle cx="78" cy="78" r="3.5" fill="black" />
            <Circle cx="80" cy="75" r="2.5" fill="white" />

            {/* Right Eye */}
            <Ellipse cx="122" cy="78" rx="11" ry="13" fill="white" />
            <Circle cx="122" cy="78" r="7" fill={config.eyeColor} />
            <Circle cx="122" cy="78" r="3.5" fill="black" />
            <Circle cx="124" cy="75" r="2.5" fill="white" />
          </G>

          {/* Eyelashes */}
          <Path
            d="M65 70 Q78 62 91 70"
            stroke="#333"
            strokeWidth="1.5"
            fill="none"
          />
          <Path
            d="M109 70 Q122 62 135 70"
            stroke="#333"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Eyebrows - elegant arch */}
          <Path
            d="M68 58 Q78 52 88 58"
            stroke="#5D4E37"
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M112 58 Q122 52 132 58"
            stroke="#5D4E37"
            strokeWidth="2"
            fill="none"
          />

          {/* Glasses - round frames */}
          <G>
            {/* Left lens frame */}
            <Ellipse cx="78" cy="80" rx="18" ry="16" stroke="#4A4A4A" strokeWidth="2.5" fill="none" />
            {/* Right lens frame */}
            <Ellipse cx="122" cy="80" rx="18" ry="16" stroke="#4A4A4A" strokeWidth="2.5" fill="none" />
            {/* Bridge */}
            <Path d="M96 80 Q100 75 104 80" stroke="#4A4A4A" strokeWidth="2" fill="none" />
            {/* Temple arms */}
            <Path d="M60 78 L55 75" stroke="#4A4A4A" strokeWidth="2" fill="none" />
            <Path d="M140 78 L145 75" stroke="#4A4A4A" strokeWidth="2" fill="none" />
          </G>

          {/* Nose */}
          <Path
            d="M100 88 L98 96 L102 96 Z"
            fill="#E8B4B4"
          />

          {/* Mouth - gentle smile */}
          <Path
            d="M88 108 Q100 116 112 108"
            stroke="#E07A7A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Front Hair - Wavy bangs and sides */}
          <Path
            d="M35 65 Q50 35 100 30 Q150 35 165 65 Q160 55 140 50 Q120 45 100 48 Q80 45 60 50 Q40 55 35 65"
            fill="url(#hairGradient)"
          />

          {/* Side hair strands */}
          <Path
            d="M50 60 Q45 90 48 120"
            stroke={config.hairColor}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M150 60 Q155 90 152 120"
            stroke={config.hairColor}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />

          {/* Small pearl earrings */}
          <Circle cx="52" cy="95" r="4" fill="#FFF8DC" />
          <Circle cx="148" cy="95" r="4" fill="#FFF8DC" />
        </AnimatedG>
      </Svg>
    </Animated.View>
  );
};

// Helper component for animated G
const AnimatedG = Animated.createAnimatedComponent(G);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DollCharacter;
