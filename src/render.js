const React = require('react');
const {renderToString} = require('react-dom/server');

module.exports = (App, data) => {
  return renderToString(React.createElement(App, data));
};
