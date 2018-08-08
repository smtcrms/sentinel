import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { buttonStyle } from '../Assets/commonStyles'

const styles = theme => ({
    disabledBtn: {
        backgroundColor: '#F2F2F2',
        height: '46px',
        width: '120px'
    },
    highlightBtn: {
        backgroundColor: '#FFFFFF',
        height: '46px',
        width: '120px'
    }
});

class CustomButton extends Component {
    render() {
        console.log('values: ', this.props)

        const { classes } = this.props;
        return (
            <Button onClick={this.props.onClick} variant={ this.props.active ? 'contained' : 'flat' } component="span" className={ this.props.active ? classes.highlightBtn : classes.disabledBtn }>
                {this.props.label}
            </Button>
        );
    }
}

CustomButton.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomButton);