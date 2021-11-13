// Loading event
addEventListener('load', function () {
  const loaderWrapper = document.querySelector('#loader-wrapper')
  loaderWrapper.remove()
})

//////////////////////////////////////////////////////////////////


const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users'

const friendList = JSON.parse(localStorage.getItem('friendList')) || []
let totalPage// 總共有幾頁
const amountPerPage = 24 // 每頁幾筆資料
let currentPage = 1 // 當前頁面
let temporaryUserData // user從friendList被去除後，為避免誤按，將刪除的user data暫存於此變量，保留redo的可能性

const cardGroup = document.querySelector('#card-group')
const userModal = document.querySelector('#user-modal')
const previousButton = document.querySelector('#page-previous')
const nextButton = document.querySelector('#page-next')
const paginator = document.querySelector('#paginator')
const addFriendButton = document.querySelector('#button-add-friend')

// Initialization
console.log('refresh')
// Card group:
clearHTML(cardGroup)
getUsersByPage(1).forEach(renderUserCard)
// Paginator:
clearHTML(paginator)
totalPage = getTotalPage(friendList.length)
renderPaginator(totalPage)

// Add evnet listeners
cardGroup.addEventListener('click', onCardClicked)
addFriendButton.addEventListener('click', onAddFriendButtonClicked)
paginator.addEventListener('click', onPaginatorClicked)
addEventListener('storage', event => location.reload())  // 當localStorage改變了，此頁刷新


// functions ===========================================================================

function getTotalPage (length) {
  const total = Math.ceil(length / amountPerPage)
  return total
}

// 12 per page
function getUsersByPage (page) {
  // page:1 users:0-23
  // page:2 users:24-47
  const list = [] // 要回傳的名單
  const friendList = JSON.parse(localStorage.getItem('friendList')) || []
  const startIndex = (page - 1) * amountPerPage // 0*24=0 1*24=24 2*24=48
  const endIndex = (page * amountPerPage) - 1 // 1*24-1=23 2*24-1=47
  for (let i = startIndex; i <= endIndex; i++) {
    if(friendList[i] !== undefined) {
      list.push(friendList[i])
    }
  }
  return list
}

// id from 601~800
function updateUserModal (id) {
  if(id < 601 || id > 800) {
    return false
  }
  const friendList = JSON.parse(localStorage.getItem('friendList')) || []
  // 添加user id attribute到按鈕上
  addFriendButton.dataset.id = id
  // 確認user是否為friend，以此決定按鈕外觀
  let isFriend = friendList.some(user => Number(user.id) === Number(id))
  if (isFriend) {
    changeAddFriendButton()
  } else {
    resetAddFriendButton()
  }
  
  const data = friendList.find(user => user.id === id)
 
  const modalImage = document.querySelector('#modal-image')
  const modalUsername = document.querySelector("#modal-username")
  const modalSurname = document.querySelector("#modal-surname")
  const modalEmail = document.querySelector("#modal-email")
  const modalGender = document.querySelector("#modal-gender")
  const modalAge = document.querySelector("#modal-age")
  const modalRegion = document.querySelector("#modal-region")
  const modalBirthday = document.querySelector("#modal-birthday")
  const modalUpdateTime = document.querySelector('#modal-update-time')

  modalImage.src = data.avatar
  modalUsername.innerText = data.name
  modalSurname.innerText = data.surname
  modalEmail.innerText = data.email
  modalGender.innerText = data.gender
  modalAge.innerText = data.age
  modalRegion.innerText = data.region
  modalBirthday.innerText = data.birthday
  modalUpdateTime.innerText = data.updated_at
}

function renderUserCard (data) {
  let htmlContent = ''
  htmlContent += `
    <div class="col-lg-2 col-md-4 col-sm-6">
      <div class="card h-100" data-bs-toggle="modal" data-bs-target="#user-modal">
        <img src=${data.avatar} class="card-img-top img-thumbnail" alt="..." data-id=${data.id}>
        <div class="card-body d-flex flex-row justify-content-between align-items-center" data-id=${data.id}>
          <h5 class="card-title mb-2" id="username" data-id=${data.id}>${data.name}</h5>         
  `
  // 如果user是friend則classList contains 'fas' else 'far'
  const friendList = JSON.parse(localStorage.getItem('friendList')) || []
  let isFriend = friendList.some(user => Number(user.id) === Number(data.id))
  if (isFriend) {
    htmlContent += `
        <i class="fas fa-heart fa-lg mb-2" data-id=${data.id}></i>
          </div>
        </div>
      </div>
    `
  } else {
    htmlContent += `
      <i class="far fa-heart fa-lg mb-2" data-id=${data.id}></i>
          </div>
        </div>
      </div>
    `
  }
  cardGroup.innerHTML += htmlContent
}

function renderPaginator (page) {
  let htmlContent = ''
  // 預設第一頁，<預設disabled
  htmlContent += `
    <ul class="pagination justify-content-center">
      <li class="page-item disabled" id="page-previous">
        <a class="page-link" href="#" aria-label="Previous">
          <span aria-hidden="true"><</span>
        </a>
      </li>
  `
  // 有幾頁就渲染幾個頁面按鈕
  for (let i = 1; i <= page; i++) {
    if (i === 1) {
      htmlContent += `
        <li class="page-item active"><a class="page-link" href="#" data-page=${i}>${i}</a></li>
      `
    } else {
      htmlContent += `
        <li class="page-item"><a class="page-link" href="#" data-page=${i}>${i}</a></li>
      ` 
    }
  }
  // 如果結果只有一頁，把>箭頭disabled
  if (page === 1) {
    htmlContent += `

        <li class="page-item disabled" id="page-next">
            <a class="page-link" href="#" aria-label="Next">
              <span aria-hidden="true">></span>
            </a>
        </li>
      </ul>
    `
  } else {
    htmlContent += `

        <li class="page-item" id="page-next">
            <a class="page-link" href="#" aria-label="Next">
              <span aria-hidden="true">></span>
            </a>
        </li>
      </ul>
    `
  }
  paginator.innerHTML = htmlContent

  // currentPage active
  const activePageElement = document.querySelector(`[data-page="${currentPage}"]`)
  if (!activePageElement.classList.contains('active')) {
    activePageElement.classList.add('active')
  }
}

function onCardClicked (event) {
  const target = event.target
  const id = Number(target.dataset.id)
  if (id !== null || id !== undefined) {
    updateUserModal(id)
  }
}

function onPaginatorClicked (event) {
  event.preventDefault()
  
  const target = event.target
  const activePageElement = document.querySelector(`[data-page="${currentPage}"]`)
  const previousButton = document.querySelector('#page-previous')
  const nextButton = document.querySelector('#page-next')
  const clickedPage = Number(target.dataset.page)

  // 如果按到外圍空白處，return
  if (target.tagName === 'UL') {
    console.log('Early return')
    return
  }

  if (target.classList.contains('disabled') || currentPage === clickedPage) {
    console.log('Early return')
    return
  }

  console.log('Current page', currentPage)
  activePageElement.parentElement.classList.remove('active')
  if (target.innerText === '<') {
    currentPage -= 1
  } else if (target.innerText === '>') {
    currentPage += 1
  } else {
    currentPage = clickedPage
  }
  const newActivePageElement = document.querySelector(`[data-page="${currentPage}"]`)
  newActivePageElement.parentElement.classList.add('active')
  
  console.log('New current page:', currentPage)
  console.log('Total page:', totalPage)

  previousButton.classList.remove('disabled')
  nextButton.classList.remove('disabled')
  if (currentPage === 1) {
    previousButton.classList.add('disabled')
  } else if (currentPage === totalPage) {
    nextButton.classList.add('disabled')
  }

  // Render current page's user content
  clearHTML(cardGroup)
  getUsersByPage(currentPage).forEach(renderUserCard)
}

function onAddFriendButtonClicked (event) {
  const target = event.target
  console.log('Button Clicked')

  const id = Number(target.dataset.id)
  const friendList = JSON.parse(localStorage.getItem('friendList')) || []

  let isFriend = friendList.some(user => Number(user.id) === id)

  // 如果按鈕在'My Friend!'的狀態下被點擊:
  if (isFriend) {
    // 重設按鈕外觀
    resetAddFriendButton()
    let userIndex = friendList.findIndex(user => Number(user.id) === id)
    temporaryUserData = friendList[userIndex] // 將被刪的user data存起來
    friendList.splice(userIndex, 1)
    localStorage.setItem('friendList', JSON.stringify(friendList))
    console.log('Friend removed')
  } else if (id === temporaryUserData.id) {
    // 如果使用者要將本來刪除的user加回來:
    console.log('Friend revived')
    friendList.push(temporaryUserData)
    localStorage.setItem('friendList', JSON.stringify(friendList))

    // 改變按鈕外觀
    changeAddFriendButton()
  } else {
    const user = friendList.find(user => Number(user.id) === id)
    console.log('Friend added')
    friendList.push(user)

    localStorage.setItem('friendList', JSON.stringify(friendList))

    // 改變按鈕外觀
    changeAddFriendButton()
  }
  // 重新RENDER卡片
  clearHTML(cardGroup)
  getUsersByPage(currentPage).forEach(renderUserCard)

  // 重新RENDER分頁器
  clearHTML(paginator)
  newTotalPage = getTotalPage(friendList.length)
  if (newTotalPage !== totalPage) {
    totalPage = newTotalPage
    if (currentPage > newTotalPage) {
      currentPage = newTotalPage
      getUsersByPage(currentPage).forEach(renderUserCard)
    }
  }
  renderPaginator(newTotalPage)
}

function changeAddFriendButton () {
  addFriendButton.innerText = 'My Friend!'
  addFriendButton.classList.remove('btn-primary')
  addFriendButton.classList.add('btn-success')
}

function resetAddFriendButton () {
  addFriendButton.innerText = 'Add Friend'
  addFriendButton.classList.remove('btn-success')
  addFriendButton.classList.add('btn-primary')
}

function clearHTML (container) {
  container.innerHTML = ''
}