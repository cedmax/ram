const index = 'index'
const detail = 'detail'
const create = 'create'
const debug = 'debug'

const modes = {
  index,
  detail,
  create,
  debug
}

const appTypes = {
  react: {
    name: 'React App',
    install: (name) => `create-react-app ${name}`,
    defaults: {
      type: 'create-react-app',
      port: 3000,
      run: 'run start'
    }
  },
  next: {
    name: 'Next.js App',
    install: (name) => `create-next-app ${name}`,
    defaults: {
      type: 'create-next-app',
      port: 3000,
      run: 'run dev'
    }
  },
  gatsby: {
    name: 'Gatsby App',
    install: (name) => `gatsby-cli new ${name}`,
    defaults: {
      type: 'gatsby-cli',
      port: 8000,
      run: 'run develop'
    }
  },
  razzle: {
    name: 'Razzle App',
    install: (name) => `create-razzle-app ${name}`,
    defaults: {
      type: 'create-razzle-app',
      port: 3000,
      run: 'run start'
    }
  },
  nuxt: {
    name: 'Vue App',
    install: (name) => `vue create -d ${name}`,
    defaults: {
      type: 'create-vue-app',
      port: 8080,
      run: 'run serve'
    }
  },
  preact: {
    name: 'Preact App',
    install: (name) => `preact-cli create default ${name}`,
    defaults: {
      type: 'preact-cli',
      port: 8080,
      run: 'run start'
    }
  },
  reactStatic: {
    name: 'React Static',
    install: (name) => `react-static create --template=blank --name=${name}`,
    defaults: {
      type: 'react-static',
      port: 3000,
      run: 'run start'
    }
  }
}

appTypes.options = Object.keys(appTypes).map(key => ({
  key,
  name: appTypes[key].name
}))

module.exports = {
  modes,
  appTypes
}
