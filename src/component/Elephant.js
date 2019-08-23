const React = require('react');

module.exports = function Elephant({total}) {
  return Array.from({length: total}).map((_, i) => {
    return React.createElement(
      'div',
      {
        key: `item-${i}`
      },
      `content-${i}`
    );
  });
}
