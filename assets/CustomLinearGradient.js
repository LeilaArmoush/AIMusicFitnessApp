// CustomLinearGradient.js
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import PropTypes from 'prop-types';

const rectangleButtonBlueGradient = ({ children, ...props }) => {
  return (
    <LinearGradient {...props}>
      {children}
    </LinearGradient>
  );
};

rectangleButtonBlueGradient.propTypes = {
  children: PropTypes.node,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  start: PropTypes.object,
  end: PropTypes.object,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

rectangleButtonBlueGradient.defaultProps = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
  style: {},
};

export default rectangleButtonBlueGradient;