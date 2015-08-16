'use strict';

var React = require('react');
var Application = require('core/Application.js');
var Display = require('display/Display.js');
var CanvasDisplay = require('display/CanvasDisplay.js');
var Stage = require('display/Stage.js');
var Scene = require('display/Scene.js');
var Effect = require('effects/Effect.js');
var DisplayLibrary = require('display/DisplayLibrary.js');
var EffectsLibrary = require('effects/EffectsLibrary.js');

var TextInput = require('ui/inputs/TextInput.jsx');
var ControlPickerWindow = require('ui/windows/ControlPickerWindow.jsx');

var LayersPanel = React.createClass({
    getDefaultProps: function() {
        return {
            onLayerSelected: null,
            onLayerChanged: null
        }
    },

    getInitialState: function() {
        return {
            activeIndex: 0,
            editIndex: -1,
            layers: []
        };
    },

    componentWillMount: function() {
        this.updateLayers();
    },

    handleLayerClick: function(index) {
        var state = this.state,
            props = this.props,
            editIndex = (index == state.editIndex) ? state.editIndex: -1;

        this.setState({activeIndex: index, editIndex: editIndex}, function(){
            if (props.onLayerSelected) {
                props.onLayerSelected(this.getActiveLayer());
            }
        }.bind(this));
    },

    handleDoubleClick: function(index) {
        if (index !== this.state.editIndex) {
            this.setState({editIndex: index});
        }
    },

    handleAddSceneClick: function() {
        var scene = new Scene();

        Application.stage.addScene(scene);

        this.updateLayers(function() {
            this.setActiveLayer(scene);
        }.bind(this));
    },

    handleAddDisplayClick: function() {
        var state = this.state,
            layer = state.layers[state.activeIndex],
            scene = (layer instanceof Scene) ? layer : layer.parent;

        if (Application.stage.hasScenes()) {
            Application.emit(
                'show_modal',
                <ControlPickerWindow title="ADD DISPLAY" scene={scene} items={DisplayLibrary} />
            );
        }
    },

    handleAddEffectClick: function() {
        var state = this.state,
            layer = state.layers[state.activeIndex],
            scene = (layer instanceof Scene) ? layer : layer.parent;

        if (Application.stage.hasScenes()) {
            Application.emit(
                'show_modal',
                <ControlPickerWindow title="ADD EFFECT" scene={scene} items={EffectsLibrary} />
            );
        }
    },

    handleRemoveClick: function() {
        var state = this.state,
            props = this.props,
            index = this.state.activeIndex,
            layers = state.layers,
            layer = layers[index],
            last = layers.length - 1;

        if (Application.stage.hasScenes() && layer) {
            if (layer instanceof Scene) {
                layer.parent.removeScene(layer);
            }
            else if (layer instanceof Display) {
                layer.parent.removeDisplay(layer);
            }

            this.updateLayers(function(){
                if (index === last) {
                    this.setState({activeIndex: last - 1});
                }
            });

            if (props.onLayerChanged) {
                props.onLayerChanged();
            }
        }
    },

    handleMoveUpClick: function() {
        this.moveLayer(1);
    },

    handleMoveDownClick: function() {
        this.moveLayer(-1);
    },

    handleLayerEdit: function(val) {
        var layer = this.getActiveLayer();

        layer.displayName = val;

        this.cancelEdit();
    },

    cancelEdit: function() {
        this.setState({ editIndex: -1 });
    },

    getActiveLayer: function() {
        var state = this.state;

        return state.layers[state.activeIndex];
    },

    setActiveLayer: function(i) {
        var props = this.props,
            index = (typeof i === 'number') ? i : this.state.layers.indexOf(i);

        this.setState({ activeIndex: index }, function(){
            if (props.onLayerSelected) {
                props.onLayerSelected(this.getActiveLayer());
            }
        });
    },

    getLayerComponent: function(obj, index) {
        var text, icon,
            state = this.state,
            classes = 'layer';

        if (!(obj instanceof Scene)) {
            classes += ' layer-control';
        }

        if (index === this.state.editIndex) {
            classes += ' layer-edit';
        }
        else if (index === this.state.activeIndex) {
            classes += ' layer-active';
        }

        if (state.editIndex === index) {
            var handleChange = function(name, val) {
                if (val.length > 0) {
                    this.handleLayerEdit(val, index);
                }
            }.bind(this);

            text = (
                <TextInput
                    value={obj.displayName}
                    buffered={true}
                    autoFocus={true}
                    autoSelect={true}
                    onChange={handleChange}
                    onCancel={this.cancelEdit}
                />
            );
        }
        else {
            text = (
                <span onDoubleClick={this.handleDoubleClick.bind(this, index)}>
                    {obj.displayName}
                </span>
            );
        }

        if (obj instanceof Scene) {
            icon = <i className="layer-icon icon-picture" />;
        }
        else if (obj instanceof CanvasDisplay) {
            icon = <i className="layer-icon icon-document-landscape" />;
        }
        else if (obj instanceof Effect) {
            icon = <i className="layer-icon icon-light-up" />;
        }
        else if (obj instanceof Display) {
            icon = <i className="layer-icon icon-cube" />;
        }

        return (
            <div key={obj.toString()}
                 className={classes}
                 onClick={this.handleLayerClick.bind(this, index)}>
                {icon} {text}
            </div>
        );
    },

    updateLayers: function(callback) {
        var layers = [];

        Application.stage.scenes.nodes.reverse().forEach(function(scene) {
            layers.push(scene);

            scene.displays.nodes.reverse().forEach(function(display) {
                layers.push(display);
            }, this);
        }, this);

        this.setState({ layers: layers }, callback);
    },

    moveLayer: function(direction) {
        var index,
            props = this.props,
            layer = this.getActiveLayer();

        if (layer instanceof Scene) {
            layer.parent.moveScene(layer, direction);
        }
        else if (layer instanceof Display) {
            layer.parent.moveDisplay(layer, direction);
        }

        this.updateLayers(function(){
            index = this.state.layers.indexOf(layer);
            this.setState({ activeIndex: index });

            props.onLayerChanged(function() {
                props.onLayerSelected(this.getActiveLayer());
            }.bind(this));
        }.bind(this));
    },

    render: function() {
        var layers,
            hasScenes = Application.stage.hasScenes(),
            addClasses = 'btn icon-cube',
            fxClasses = 'btn icon-light-up',
            removeClasses = 'btn icon-trash-empty',
            moveUpClasses = 'btn icon-chevron-up',
            moveDownClasses = 'btn icon-chevron-down';

        if (!hasScenes) {
            addClasses += ' btn-disabled';
            fxClasses += ' btn-disabled';
            removeClasses += ' btn-disabled';
            moveUpClasses += ' btn-disabled';
            moveDownClasses += ' btn-disabled';
        }

        layers = this.state.layers.map(function(layer, index) {
            return this.getLayerComponent(layer, index);
        }, this);

        return (
            <div className="layers-panel">
                <div className="layers">
                    {layers}
                </div>
                <ul className="btn-group">
                    <li className="btn icon-picture" title="Add Scene" onClick={this.handleAddSceneClick} />
                    <li className={addClasses} title="Add Display" onClick={this.handleAddDisplayClick} />
                    <li className={fxClasses} title="Add Effect" onClick={this.handleAddEffectClick} />
                    <li className={moveUpClasses} title="Move Layer Up" onClick={this.handleMoveUpClick} />
                    <li className={moveDownClasses} title="Move Layer Down" onClick={this.handleMoveDownClick} />
                    <li className={removeClasses} title="Delete Layer" onClick={this.handleRemoveClick} />
                </ul>
            </div>
        );
    }
});

module.exports = LayersPanel;