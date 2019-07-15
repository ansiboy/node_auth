"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

define(["require", "exports", "modules/components/react", "../config"], function (require, exports, React, config_1) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var Toolbar =
  /*#__PURE__*/
  function (_React$Component) {
    _inherits(Toolbar, _React$Component);

    function Toolbar(props) {
      var _this;

      _classCallCheck(this, Toolbar);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Toolbar).call(this, props));

      _this.pageShowin = function (sender, page) {
        _this.setState({
          currentPageName: page.name
        });
      };

      _this.state = {
        currentPageName: null
      };
      return _this;
    }

    _createClass(Toolbar, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this.props.app.pageShowing.add(this.pageShowin);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.props.app.pageShowing.remove(this.pageShowin);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var showLoginButton = ['forget-password', 'login', 'register'].indexOf(this.state.currentPageName) < 0;
        return React.createElement("ul", null, showLoginButton ? React.createElement("li", {
          className: "light-blue pull-right",
          style: {
            color: 'white',
            paddingTop: 4,
            cursor: 'pointer'
          },
          onClick: function onClick() {
            _this2.props.app.logout();

            if (config_1.config.logoutRedirectURL) {
              location.href = config_1.config.logoutRedirectURL;
              return;
            }

            _this2.props.app.redirect('login');
          }
        }, React.createElement("i", {
          className: "icon-off"
        }), React.createElement("span", {
          style: {
            paddingLeft: 4
          }
        }, "\u9000\u51FA")) : null);
      }
    }]);

    return Toolbar;
  }(React.Component);

  exports.Toolbar = Toolbar;
});