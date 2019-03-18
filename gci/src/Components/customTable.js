import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import { lighten } from "@material-ui/core/styles/colorManipulator";
import { compose } from "recompose";

let counter = 0;
function createData(obj) {
    counter += 1;
    obj.id = counter;
    return obj;
}

function desc(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getSorting(order, orderBy) {
    return order === "desc"
        ? (a, b) => desc(a, b, orderBy)
        : (a, b) => -desc(a, b, orderBy);
}

class EnhancedTableHead extends React.Component {
    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const { order, orderBy, classes } = this.props;

        let columnData = [
            {
                id: "validator_address",
                numeric: false,
                disablePadding: false,
                label: "Validator Address"
            },
            {
                id: "shares",
                numeric: true,
                disablePadding: false,
                label: `Shares`
            }
        ];

        return (
            <TableHead>
                <TableRow>
                    {columnData.map(column => {
                        return (
                            <TableCell
                                key={column.id}
                                numeric={column.numeric}
                                sortDirection={
                                    orderBy === column.id ? order : false
                                }
                                padding={"dense"}
                                className={classes.head}
                            >
                                <TableSortLabel
                                    active={orderBy === column.id}
                                    direction={order}
                                    onClick={this.createSortHandler(column.id)}
                                >
                                    {column.label}
                                </TableSortLabel>
                            </TableCell>
                        );
                    }, this)}
                </TableRow>
            </TableHead>
        );
    }
}

EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired
};

const alignStyle = theme => ({
    center: {
        textAlign: "center",
        marginLeft: 25
    },
    head: {
        padding: 7,
        textAlign: "center"
    }
});

EnhancedTableHead = withStyles(alignStyle)(EnhancedTableHead);

const toolbarStyles = theme => ({
    root: {
        paddingRight: theme.spacing.unit
    },
    highlight:
        theme.palette.type === "light"
            ? {
                  color: theme.palette.secondary.main,
                  backgroundColor: lighten(theme.palette.secondary.light, 0.85)
              }
            : {
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.secondary.dark
              },
    spacer: {
        flex: "1 1 100%"
    },
    actions: {
        color: theme.palette.text.secondary
    },
    title: {
        flex: "0 0 auto"
    }
});

let EnhancedTableToolbar = props => {
    const { numSelected, classes } = props;

    return (
        <Toolbar
            className={classNames(classes.root, {
                [classes.highlight]: numSelected > 0
            })}
        >
            <div className={classes.title}>
                <Typography variant="title" id="tableTitle">
                    {"Delegations List"}
                </Typography>
            </div>
            <div className={classes.spacer} />
            <div className={classes.actions}>
                {numSelected > 0 ? (
                    <Tooltip title="Delete">
                        <IconButton aria-label="Delete">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                ) : (
                    ""
                )}
            </div>
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = theme => ({
    root: {
        width: "100%",
        marginTop: theme.spacing.unit * 3,
        height: 450,
        overflowY: "auto"
    },
    table: {},
    tableWrapper: {
        overflowY: "auto"
    },
    head: {
        padding: 5,
        textAlign: "center",
        wordBreak: "break-all"
    }
});

class EnhancedTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            openDialog: false,
            order: "asc",
            orderBy: "shares",
            selected: [],
            page: 0,
            rowsPerPage: 5,
            data: {}
        };
    }

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = "desc";

        if (this.state.orderBy === property && this.state.order === "desc") {
            order = "asc";
        }

        this.setState({ order, orderBy });
    };

    isSelected = id => this.state.selected.indexOf(id) !== -1;

    render() {
        const { classes } = this.props;
        counter = 0;
        let data = this.props.data.map(obj => {
            return createData(obj);
        });
        const { order, orderBy } = this.state;

        return (
            <Paper className={classes.root}>
                <div className={classes.tableWrapper}>
                    <Table
                        className={classes.table}
                        aria-labelledby="tableTitle"
                    >
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={this.handleRequestSort}
                            rowCount={data.length}
                        />
                        <TableBody>
                            {data.sort(getSorting(order, orderBy)).map(n => {
                                return (
                                    <TableRow hover role="button" key={n.id}>
                                        <TableCell
                                            padding="dense"
                                            className={classes.head}
                                        >
                                            {n.validator_address}
                                        </TableCell>
                                        <TableCell
                                            numeric
                                            padding="dense"
                                            className={classes.head}
                                        >
                                            {n.shares
                                                ? parseInt(n.shares) /
                                                  (10 ** 6).toFixed(3)
                                                : 0}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Paper>
        );
    }
}

EnhancedTable.propTypes = {
    classes: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {};
}

function mapDispatchToActions(dispatch) {
    return bindActionCreators({}, dispatch);
}

export default compose(
    withStyles(styles),
    connect(
        mapStateToProps,
        mapDispatchToActions
    )
)(EnhancedTable);
