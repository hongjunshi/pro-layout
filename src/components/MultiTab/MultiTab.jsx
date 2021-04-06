import events from './events'
const MultiTab = {
  name: 'MultiTab',
  data() {
    return {
      fullPathList: [],
      pages: [],
      activeKey: '',
      newTabIndex: 0,
      cacheViews: []
    }
  },
  created() {
    // bind event
    events
      .$on('open', val => {
        if (!val) {
          throw new Error(`multi-tab: open tab ${val} err`)
        }
        this.activeKey = val
      })
      .$on('close', val => {
        if (!val) {
          this.closeThat(this.activeKey)
          return
        }
        this.closeThat(val)
      })
      .$on('rename', ({ key, name }) => {
        try {
          const item = this.pages.find(item => item.path === key)
          item.meta.customTitle = name
          this.$forceUpdate()
        } catch (e) {}
      })
    this.$watch('$route', newVal => {
      console.log(newVal)
      this.activeKey = newVal.fullPath
      if (this.fullPathList.indexOf(newVal.fullPath) < 0) {
        this.fullPathList.push(newVal.fullPath)
        this.pages.push(newVal)
      }
      this.addCachedView(newVal)
    })
    this.$watch('activeKey', newPathKey => {
      console.log('activeKey=',newPathKey)
      this.$router.push({ path: newPathKey })
    })
    this.pages.push(this.$route)
    this.fullPathList.push(this.$route.fullPath)
    this.selectedLastPath()
    this.addCachedView(this.$route)
  },
  methods: {
    onChange(activeKey) {
     this.activeKey = activeKey
    },
    onEdit(targetKey, action) {
      this[action](targetKey)
    },
    addCachedView(view) {
      if (!this.cacheViews.find(v => v.fullPath === view.fullPath)) {
        this.cacheViews.push(view)
      }
    },
    removeCachedView(view) {
      const viewIndex = this.cacheViews.findIndex(v => v.fullPath === view.fullPath)
      const removedView = this.cacheViews.find(v => v.fullPath === view.fullPath)
      if (viewIndex > -1) {
        this.cacheViews.splice(viewIndex, 1)
        this.removeViewCache(removedView)
      }
    },
    removeViewCache(removedView) {
      const view = removedView.matched[removedView.matched.length - 1]
      const $vnode = view.instances.default.$vnode
      if ($vnode ) {
        if ($vnode.parent && $vnode.parent.componentInstance && $vnode.parent.componentInstance.cache) {
          if ($vnode.componentOptions) {
            const key =
              $vnode.key == null
                ? $vnode.componentOptions.Ctor.cid + ($vnode.componentOptions.tag ? `::${$vnode.componentOptions.tag}` : '')
                : $vnode.key
            const cache = $vnode.parent.componentInstance.cache
            const keys = $vnode.parent.componentInstance.keys
            if (cache[key]) {
              if (keys.length) {
                const index = keys.indexOf(key)
                if (index > -1) {
                  keys.splice(index, 1)
                }
              }
              delete cache[key]
            }
          }
        }
      }
    },
    remove(targetKey) {
      const view = this.pages.find(page => page.fullPath === targetKey)
      if (view) {
        this.removeCachedView(view)
      }
      this.pages = this.pages.filter(page => page.fullPath !== targetKey)
      this.fullPathList = this.fullPathList.filter(path => path !== targetKey)
      // 判断当前标签是否关闭，若关闭则跳转到最后一个还存在的标签页
      if (!this.fullPathList.includes(this.activeKey)) {
        this.selectedLastPath()
      }
    },
    selectedLastPath() {
      this.activeKey = this.fullPathList[this.fullPathList.length - 1]
    },

    // content menu
    closeThat(e) {
      // 判断是否为最后一个标签页，如果是最后一个，则无法被关闭
      if (this.fullPathList.length > 1) {
        this.remove(e)
      } else {
        this.$message.info('这是最后一个标签了, 无法被关闭')
      }
    },
    closeLeft(e) {
      const currentIndex = this.fullPathList.indexOf(e)
      if (currentIndex > 0) {
        this.fullPathList.forEach((item, index) => {
          if (index < currentIndex) {
            this.remove(item)
          }
        })
      } else {
        this.$message.info('左侧没有标签')
      }
    },
    closeRight(e) {
      const currentIndex = this.fullPathList.indexOf(e)
      if (currentIndex < this.fullPathList.length - 1) {
        this.fullPathList.forEach((item, index) => {
          if (index > currentIndex) {
            this.remove(item)
          }
        })
      } else {
        this.$message.info('右侧没有标签')
      }
    },
    closeAll(e) {
      const currentIndex = this.fullPathList.indexOf(e)
      this.fullPathList.forEach((item, index) => {
        if (index !== currentIndex) {
          this.remove(item)
        }
      })
    },
    closeMenuClick(key, route) {
      this[key](route)
    },
    renderTabPaneMenu(e) {
      return (
        <a-menu
          {...{
            on: {
              click: ({ key, item, domEvent }) => {
                this.closeMenuClick(key, e)
              }
            }
          }}
        >
          <a-menu-item key="closeThat">关闭当前标签</a-menu-item>
          <a-menu-item key="closeRight">关闭右侧</a-menu-item>
          <a-menu-item key="closeLeft">关闭左侧</a-menu-item>
          <a-menu-item key="closeAll">关闭全部</a-menu-item>
        </a-menu>
      )
    },
    // render
    renderTabPane(title, keyPath) {
      const menu = this.renderTabPaneMenu(keyPath)
      const titleI18n = this.$t(title)
      return (
        <a-dropdown overlay={menu} trigger={['contextmenu']}>
          <span style={{ userSelect: 'none' }}>{titleI18n || title}</span>
        </a-dropdown>
      )
    }
  },

  render(h) {
    const {
      onEdit,
      onChange,
      $data: { pages },
    } = this
    const panes = pages.map(page => {
      return (
        <a-tab-pane
          style={{ height: 0 }}
          tab={this.renderTabPane(page.meta.customTitle || page.meta.title, page.fullPath)}
          key={page.fullPath} closable={pages.length > 1}
        >
        </a-tab-pane>)
    })

    return (
      <div class="ant-pro-multi-tab">
        <div class="ant-pro-multi-tab-wrapper">
          <a-tabs
            hideAdd
            type={'editable-card'}
            v-model={ this.activeKey }
            tabBarStyle={{ background: '#FFF', margin: 0, paddingLeft: '16px', paddingTop: '1px' }}
            {...{ on: { edit: onEdit,change:onChange } }}
          >
            {panes}
          </a-tabs>
        </div>
      </div>
    )
  }
}
export default MultiTab
