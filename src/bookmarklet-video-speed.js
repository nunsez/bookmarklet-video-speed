(() => {
    const prefix        =   'nunsez-video-bookmarklet'
    const defaultSpeed  =   100
    const storageId     =   `${prefix}-memory`
    const controllerId  =   `${prefix}-controller`
    const datalistId    =   `${prefix}-tickmarks`
    const styles        =   {
        default:    'box-sizing: border-box;',
        spacing:    'margin: 0; padding: 4px;',
        borders:    'border: 1px solid #444;border-radius: 4px;background-color: #eee;',
        controls:   'display: flex;justify-content: space-between;align-items: center;',
        btn:        'width: 20px;height: 20px;margin: 0;padding: 0;',
        value:      'pointer-events: none;',
        range:      'width: 100%;',
        controller: `position: fixed;left: 8px;top: 8px;width: 150px; font: 15px monospace;
                    color: #111;box-shadow: 1px 1px 4px #444;user-select: none;z-index: 999999999;`,
    }

    const getDatalistOptions = (valueList) => valueList.map((v) => `<option value="${v}"></option>`).join('\n')

    const getIDoc = (ref) => ref.contentWindow.document || ref.contentDocument

    const getSpeed = () => localStorage.getItem(storageId) || defaultSpeed

    const setSpeed = (newSpeed, state) => {
        if (typeof newSpeed === 'string') newSpeed = Number.parseFloat(newSpeed)
        if (Number.isNaN(newSpeed)) return

        switch (true) {
            // The 0.05x playback rate is not in the supported playback range
            case newSpeed === 5:    state.speed > 5 ? state.speed = 0 : state.speed = 10;   break
            case newSpeed > 300:    state.speed = 300;                                      break
            case newSpeed < 0:      state.speed = 0;                                        break
            default:                state.speed = newSpeed;                                 break
        }

        state.value.textContent = state.speed + '%'
        state.range.value = state.speed
        state.videos.forEach((v) => v.playbackRate = state.speed / 100)
        localStorage.setItem(storageId, state.speed)
    }

    const getVideos = (body) => {
        const videos = []

        body.querySelectorAll('video, iframe').forEach((el) => {
            switch (el.tagName) {
                case 'VIDEO': {
                    if (el.playbackRate) videos.push(el)
                    break
                }
                case 'IFRAME': {
                    const vid = getIDoc(el).querySelector('video')
                    if (vid?.playbackRate) videos.push(vid)
                    break
                }
                default: break
            }
        })

        return videos.length ? videos : null
    }

    const main = (body) => {
        const state = {
            speed: getSpeed(),
            videos: getVideos(body),
            oldController: body.querySelector(`#${controllerId}`),
            value: null,
            range: null,
        }

        if (!state.videos) {
            alert("Sorry, i can't find any html5 videos :(")
            return
        }

        // remove controller if exist and restore video playback speed
        if (state.oldController) {
            state.oldController.remove()
            state.videos.forEach((v) => v.playbackRate = 1)
            return
        }

        // create controller and his components
        const controller = document.createElement('div')
        controller.setAttribute('id', controllerId)
        controller.style = styles.default + styles.spacing + styles.borders + styles.controller

        const controls = document.createElement('div')
        controls.style = styles.default + styles.spacing + styles.controls

        const btnSub = document.createElement('button')
        btnSub.textContent = '-'
        btnSub.style = styles.default + styles.borders + styles.btn

        const value = document.createElement('div')
        value.style = styles.default + styles.value
        state.value = value

        const btnAdd = document.createElement('button')
        btnAdd.textContent = '+'
        btnAdd.style = styles.default + styles.borders + styles.btn

        const datalist = document.createElement('datalist')
        datalist.setAttribute('id', datalistId)
        datalist.innerHTML = getDatalistOptions([10, 50, 100, 150, 200, 250, 300])

        const range = document.createElement('input')
        range.type = 'range'
        range.min = 10
        range.max = 300
        range.step = 10
        range.setAttribute('list', datalist.getAttribute('id'))
        range.style = styles.default + styles.spacing + styles.range
        state.range = range

        // append elements to body tag
        controls.append(btnSub, value, btnAdd)
        controller.append(controls, range, datalist)
        body.append(controller)

        // add listeners
        btnSub.addEventListener('click',    () => setSpeed(state.speed - 5, state))
        btnAdd.addEventListener('click',    () => setSpeed(state.speed + 5, state))
        range.addEventListener('input',     () => setSpeed(Number.parseFloat(range.value), state))

        // init controller
        setSpeed(state.speed, state)
    }

    main(document.body)
})()
