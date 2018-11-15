const yaml = require('js-yaml')
const fs = require('fs')
const path = require(`path`)
const nav = yaml.safeLoad(fs.readFileSync('./src/data/nav.yaml', 'utf8'))
const charts = yaml.safeLoad(fs.readFileSync('./src/data/charts.yml', 'utf8'))

const bestofjsNameToSlug = require('../../../home/src/helpers/bestofjs-slugify')
const got = require('got')
const crypto = require('crypto')
/*

TODO: use https://www.gatsbyjs.org/docs/actions/#setWebpackConfig
see: https://www.gatsbyjs.org/docs/migrating-from-v1-to-v2/#change-modifywebpackconfig-to-oncreatewebpackconfig

(not sure if we still need this though…)
*/

// exports.modifyWebpackConfig = function({ config }) {
//     config.removeLoader('md')
//     config.loader('md', cfg => {
//         cfg.test = /\.md$/
//         cfg.loader = 'html!markdown'

//         return cfg
//     })

//     return config
// }

exports.createPages = async ({ actions }) => {
    const { createRedirect, createPage } = actions

    nav.forEach(item => {
        if (item.subPages) {
            createRedirect({
                fromPath: `/${item.id}/`,
                redirectInBrowser: true,
                toPath: `/${item.id}/${item.subPages[0]}/`
            })
            createRedirect({
                fromPath: `/${item.id}`,
                redirectInBrowser: true,
                toPath: `/${item.id}/${item.subPages[0]}/`
            })

            let subPageContext = {}

            item.subPages.forEach(subPage => {
                const pagePath = `/${item.id}/${subPage}`
                let templateName
                let pageCharts = []
                switch (subPage) {
                    case 'overview':
                        templateName = 'Overview'
                        subPageContext = {
                            section: item.id
                        }
                        pageCharts = pageCharts.concat(charts.overview)
                        break

                    case 'other-libraries':
                        templateName = 'OtherTools'
                        pageCharts = pageCharts.concat(charts['other-libraries'])
                        break

                    case 'conclusion':
                        templateName = 'Conclusion'
                        subPageContext = {
                            section: item.id,
                            name: `${item.id}-conclusion`
                        }
                        pageCharts = pageCharts.concat(charts.conclusion)
                        break

                    default:
                        templateName = 'Tool'
                        subPageContext = {
                            section: item.id,
                            tool: subPage
                        }
                        pageCharts = pageCharts.concat(charts.tool)
                        break
                }

                createPage({
                    path: pagePath,
                    component: path.resolve(
                        `./src/components/templates/${templateName}Template.js`
                    ),
                    context: subPageContext
                })

                /*

                Create a third-level page for each chart for sharing

                */
                pageCharts.forEach(chart => {
                    const pagePath = `/${item.id}/${subPage}/${chart}`
                    createPage({
                        path: pagePath,
                        component: path.resolve(`./src/components/templates/ShareChartTemplate.js`),
                        context: { ...subPageContext, chart }
                    })
                })
            })
        } else {
            /*
    
            Create sharing pages for other sections

            */
            const pageCharts = charts[item.id]
            pageCharts &&
                pageCharts.forEach(chart => {
                    const pagePath = `/${item.id}/${chart}`
                    createPage({
                        path: pagePath,
                        component: path.resolve(`./src/components/templates/ShareChartTemplate.js`),
                        context: { section: item.id, chart }
                    })
                })
        }
    })
}

/**
 * Fix case for pages path, it's not obvious on OSX which is case insensitive,
 * but on some environments (eg. travis), it's a problem.
 *
 * Many pages are created from components, and we use upper first in that case
 * for the file name, so when gatsby generates the static page, it has the same name.
 *
 * Implement the Gatsby API “onCreatePage”.
 * This is called after every page is created.
 */
exports.onCreatePage = ({ page, actions }) => {
    const { createPage, deletePage } = actions

    return new Promise(resolve => {
        const newPage = Object.assign({}, page, {
            path: page.path.toLowerCase()
        })

        if (newPage.path !== page.path) {
            deletePage(page)
            createPage(newPage)
        }

        resolve()
    })
}

/*
Add `Project` nodes to the application GraphQL data store
See `allProject` query on http://localhost:8000/___graphql
We fetch about 500 projects from Best of JavaScript
*/
exports.sourceNodes = async ({ boundActionCreators }) => {
    const { createNode } = boundActionCreators
    const url = 'https://bestofjs-api-v2.firebaseapp.com/projects.json'
    console.log('Loading Best of JavaScript projects from', url);
    const data = await got(url, { json: true }).then(r => r.body)
    const { projects } = data
    const sortedProjects = projects
        .filter(project => project.stars >= 100)
        .sort((a, b) => (a.stars > b.stars ? -1 : 1))
    const nodes = sortedProjects.map(project => ({
        id: bestofjsNameToSlug(project.name),
        name: project.name,
        stars: project.stars,
        github: project.full_name,
        description: project.description,
        homepage: project.url,
        parent: null,
        children: [],
        internal: {
            type: `Project`,
            contentDigest: crypto
                .createHash(`md5`)
                .update(JSON.stringify(project))
                .digest(`hex`),
        },
    }))
    nodes.forEach(node => createNode(node))
}
