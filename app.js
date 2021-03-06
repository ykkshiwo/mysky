//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var that = this

    // 登录
    wx.login({
      success: res => {
        wx.request({
          url: 'https://www.kkykykk.xyz/openid',
          method: "PUT",
          data: {
            js_code: res.code
          },
          header: { 'content-type': 'application/json' },
          success: function (res) {
            that.globalData.openid = res.data.openid
            console.log(res.data.openid, "从服务器得到的哦");
            //wx.setStorageSync('openid', res.data.openid)
          },
        })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        that.globalData.c_lat = res.latitude
        that.globalData.c_long = res.longitude
      }
    })

  },

  globalData: {
    openid: '',
    userInfo: null,
    is_from_fabiao: false,
    hava_jiaozhun: false,
    c_lat: null,
    c_long: null,
  }
})