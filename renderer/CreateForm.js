const fs = require('fs')
const path = require('path')
const React = require('react')
const PropTypes = require('prop-types')
const log = require('electron-log')
const {
  Flex,
  Box,
  Container,
  Heading,
  Text,
  NavLink,
  Button,
  Label,
  Input: RebassInput,
  Select: RebassSelect,
  Code,
} = require('rebass')
const styled = require('styled-components').default
const Link = require('./Link')
const { openDirectory } = require('./dialogs')
const theme = require('./theme')

const run = require('./spawn')
const {
  pushProject,
  openProject,
  pushLog
} = require('./updaters')
const { modes, appTypes } = require('./constants')
const Layout = require('./Layout')
const { createElement: h } = React

const Input = RebassInput.extend([], {
  backgroundColor: theme.colors.darken,
  boxShadow: `inset 0 0 0 1px ${theme.colors.lightgray}`,
})

const Select = RebassSelect.extend([], {
  backgroundColor: theme.colors.darken,
  boxShadow: `inset 0 0 0 1px ${theme.colors.lightgray}`,
})

class CreateForm extends React.Component {
  constructor (props) {
    super()
    this.state = Object.assign({}, props, {
      mode: modes.index,
      type: 'react',
      name: '',
      errors: {},
      pending: false
    })

    this.validate = () => {
      const errors = {}
      const {
        name,
        dirname,
      } = this.state
      const fulldir = path.join(dirname, name)
      if (fs.existsSync(fulldir)) {
        errors.name = 'Directory already exists'
      }
      return errors
    }

    this.handleChange = e => {
      const { name, value } = e.target
      this.setState({ [name]: value })
    }

    this.handleSubmit = e => {
      e.preventDefault()
      const errors = this.validate()
      const invalid = Object.keys(errors).length > 0
      this.setState({ errors })
      if (invalid) return log.error(errors)
      this.createApp()
    }

    this.createApp = () => {
      this.setState({ pending: true })
      const { update } = this.props
      const { name, type, dirname } = this.state
      const appType = appTypes[type]
      const { install } = appType
      const args = [ ...install(name).split(' ') ]
      update(pushLog([ 'npx', ...args ].join(' ')))
      update(pushLog(''))
      const promise = run('npx', args, {
        cwd: dirname,
        onLog: msg => {
          update(pushLog(msg))
        }
      })

      const { child } = promise

      child.on('close', () => {
        log.info('created app', name)
        const project = Object.assign({}, appType.defaults, {
          name,
          dirname: path.join(dirname, name),
          created: new Date().toString()
        })
        this.setState({ pending: false })
        if (!fs.existsSync(project.dirname)) return
        update(pushProject(project))
        update(openProject(project.name))
      })

      promise
        .catch(err => {
          log.error(err)
          this.setState({ pending: false })
        })
    }
  }

  render () {
    const {
      update,
      type,
      name,
      dirname,
      errors,
      pending
    } = this.state

    const appType = appTypes[type]

    return (
      h(Layout, this.props,
        h(Box, { px: 3, pb: 4 },
          h(NavLink, { is: Link, to: '/', px: 0 }, 'Back'),
          h(Flex, {
            alignItems: 'center',
          },
            h(Heading, {
              is: 'h1',
              fontSize: 6,
            }, 'Create App'),
            h(Box, { mx: 'auto' })
          ),
          h(Container, {
            maxWidth: 640,
            py: 4,
          },
            h('form', {
              onSubmit: this.handleSubmit
            },
              h(Box, { mb: 2 },
                h(Label, { htmlFor: 'dirname' }, 'Folder'),
                h(Input, {
                  type: 'text',
                  name: 'dirname',
                  value: dirname,
                  readOnly: true,
                  disabled: pending,
                  onClick: e => {
                    openDirectory({ dirname }, dir => {
                      this.setState({ dirname: dir })
                      update({ dirname: dir })
                    })
                  }
                }),
                errors.dirname && h(Text, { color: 'red' }, errors.dirname)
              ),
              h(Box, { mb: 2 },
                h(Label, { htmlFor: 'type' }, 'Application Type'),
                h(Select, {
                  name: 'type',
                  value: type,
                  onChange: this.handleChange,
                  disabled: pending,
                },
                  appTypes.options.map(({ key, name }) => h('option', {
                    key,
                    value: key,
                    label: name
                  }))
                )
              ),
              h(Box, { mb: 2 },
                h(Label, { htmlFor: 'name' }, 'Name'),
                h(Input, {
                  type: 'text',
                  name: 'name',
                  value: name,
                  disabled: pending,
                  onChange: this.handleChange,
                }),
                errors.name && h(Text, { color: 'red' }, errors.name)
              ),
              h(Button, {
                color: 'black',
                bg: 'cyan',
                mr: 3,
                disabled: !name || pending
              }, 'Create App'),
              h(Button, {
                is: Link,
                to: '/',
                my: 3,
                color: 'black',
                bg: 'gray',
              }, 'Cancel'),
              h(Text, { fontSize: 1, my: 2 },
                'This will run: ',
                h(Code, { color: 'cyan' },
                  [ 'npx', appType.install(name)].join(' ')
                )
              ),
              pending && h(Text, { color: 'blue' }, 'Creating App...'),
            )
          )
        )
      )
    )
  }
}

CreateForm.propTypes = {
  dirname: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
}

module.exports = CreateForm
