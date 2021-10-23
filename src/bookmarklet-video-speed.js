const prefix        =   'nunsez-video'
const defaultSpeed  =   100
const storageId     =   `${prefix}-memory`
const controllerId  =   `${prefix}-controller`
const datalistId    =   `${prefix}-tickmarks`
const styles        =   {
    default:    'box-sizing: border-box;',
    spacing:    'margin: 0; padding: 0.25rem;',
    borders:    'border: 1px solid #424242;border-radius: 0.25rem;background-color: #e0e0e0;',
    controls:   'display: flex;justify-content: space-between;align-items: center;',
    btn:        'width: 1.25rem;height: 1.25rem;margin: 0;padding: 0;',
    value:      'pointer-events: none;user-select: none;',
    range:      'width: 100%;',
    controller: `position: fixed;left: 0.5rem;top: 0.5rem;width: 9rem; font: 0.9rem monospace;
                color: #101010;box-shadow: 1px 1px 4px #424242;z-index: 999999999;`,
}

const getSpeed = () => localStorage.getItem(storageId) || defaultSpeed

const setSpeed = (newSpeed, state) => {
    if (typeof newSpeed === 'string') newSpeed = Number.parseFloat(newSpeed)
    if (Number.isNaN(newSpeed)) return

    switch (true) {
        // The 0.05x playback rate is not in the supported playback range.
        case newSpeed === 5:    state.speed > 5 ? state.speed = 0 : state.speed = 10;   break
        case newSpeed > 300:    state.speed = 300;                                      break
        case newSpeed < 0:      state.speed = 0;                                        break
        default:                state.speed = newSpeed;                                 break
    }

    state.value.textContent = state.speed
    state.range.value = state.speed
    state.video.playbackRate = state.speed / 100
    localStorage.setItem(storageId, state.speed)
}

const getDatalistOptions = (valueList) => valueList.map((v) => `<option value="${v}"></option>`).join('\n')

const main = (body) => {
    const state = {
        speed: getSpeed(),
        oldController: body.querySelector(`#${controllerId}`),
        video: body.querySelector('video'),
        value: null,
        range: null,
    }

    if (state.oldController) {
        state.oldController.remove()
        setSpeed(defaultSpeed, state)
        return
    }

    if (!state.video) {
        alert("Sorry, i can't find any html5 videos :(")
        return
    }

    if (!state.video.playbackRate) {
        alert("Your browser doesn't support changes of playback rate on HTML5 videos. Please use one of new browsers.")
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
