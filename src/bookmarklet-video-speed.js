/**
 * @file A script to control the speed of html5 video playback in the browser.
 * @author Alexander Mandrikov <mad.nunsez@gmail.com>
 * @version 1.0.1
 * @license Apache-2.0
 * @see {@link https://github.com/nunsez/bookmarklet-video-speed GitHub} for further information.
*/

(() => {
    const prefix = 'nunsez-video-bookmarklet'
    const defaultSpeed = 100
    const storageId = `${prefix}-memory`
    const controllerId = `${prefix}-controller`
    const datalistId = `${prefix}-tickmarks`
    const stylesheetId = `${prefix}-stylesheet`
    const styles = `#${controllerId} * { box-sizing: border-box; }`
        + `#${controllerId}, #${controllerId} .range, #${controllerId} .controls {margin: 0;padding: 4px;}`
        + `#${controllerId}, #${controllerId} .btn {border: 1px solid #444;border-radius: 4px;background-color: #eee;}`
        + `#${controllerId} {position: fixed;left: 8px;top: 8px;width: 150px;font: 15px monospace;color: #111;box-shadow: 1px 1px 4px #444;z-index: 999999999;}`
        + `#${controllerId} .controls {display: flex;justify-content: space-between;align-items: center;}`
        + `#${controllerId} .btn {width: 20px;height: 20px;margin: 0;padding: 0;}`
        + `#${controllerId} .value {pointer-events: none;user-select: none;}`
        + `#${controllerId} .value::after {content: "%";margin-left: 2px;}`
        + `#${controllerId} .range {width: 100%;}`

    const getDatalistOptions = (valueList) => valueList.map((v) => `<option value="${v}"></option>`).join('\n')

    const getIDoc = (ref) => {
        try {
            return ref.contentWindow.document || ref.contentDocument
        } catch {
            console.log("iframe document is not reachable: " + ref.src)
            return null
        }
    }

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

        state.value.textContent = state.speed
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
                    const vid = getIDoc(el)?.querySelector('video')
                    if (vid?.playbackRate) videos.push(vid)
                    break
                }
                default: break
            }
        })

        return videos.length ? videos : null
    }

    const main = (document) => {
        const { head, body } = document
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

        // remove controller if exist and restore video playback speed / toggle effect
        if (state.oldController) {
            state.oldController.remove()
            state.videos.forEach((v) => v.playbackRate = 1)
            return
        }

        // add controller stylesheet if not exist
        if (!head.querySelector(`#${stylesheetId}`)) {
            const stylesheet = document.createElement('style')
            stylesheet.setAttribute('id', stylesheetId)
            stylesheet.type = 'text/css'
            stylesheet.textContent = styles
            head.append(stylesheet)
        }

        // create controller and his components
        const controller = document.createElement('div')
        controller.setAttribute('id', controllerId)
        controller.innerHTML = '<div class="controls">'
            + '<button class="btn sub">-</button>'
            + '<div class="value"></div>'
            + '<button class="btn add">+</button></div>'
            + `<input type="range" class="range" min="10" max="300" step="10" list="${datalistId}">`
            + `<datalist id="${datalistId}">`
            + getDatalistOptions([10, 50, 100, 150, 200, 250, 300])
            + '</datalist>'

        // append elements to body tag
        body.append(controller)

        state.value = controller.querySelector('.value')
        state.range = controller.querySelector('.range')
        const btnSub = controller.querySelector('.sub')
        const btnAdd = controller.querySelector('.add')

        // add listeners
        state.range.addEventListener('input', () => setSpeed(Number.parseFloat(state.range.value), state))
        btnSub.addEventListener('click', () => setSpeed(state.speed - 5, state))
        btnAdd.addEventListener('click', () => setSpeed(state.speed + 5, state))

        // init controller
        setSpeed(state.speed, state)
    }

    main(document)
})()
