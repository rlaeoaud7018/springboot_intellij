// --- 현재 날짜 ---
let current_year;           // 현재 년도
let current_month;          // 현재 월
let current_date;           // 현재 일
let current_day;            // 현재 요일

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOCUMENT READY!!');

    // --- 오늘 날짜 ---
    let today = new Date();
    let today_year = today.getFullYear();        // 오늘 년도
    let today_month = today.getMonth();          // 오늘 월(0 ~ 11)
    let today_date = today.getDate();            // 오늘 일
    let today_day = today.getDay();              // 오늘 요일(0 ~ 6, 0 -> 일요일)

    // 현재
    setCurrentCalender(today_year, today_month, today_date, today_day);

    // 현재 (<select> UI)
    setCurrentYearAndMonthSelectUI();

    // 현재 (<tr> UI)
    addCalenderTr();

    // 이벤트 핸들러 등록
    initEvents();

});

// 현재
function setCurrentCalender(year, month, date, day) {
    console.log('setCurrentCalender() CALLED!!');

    current_year = year;
    current_month = month;
    current_date = date;
    current_day = day

}

// 현재 (<select> UI)
function setCurrentYearAndMonthSelectUI() {
    console.log('setCurrentYearAndMonthSelectUI() CALLED!!');

    document.querySelector('#section_wrap select[name="p_year"]').value = current_year;
    document.querySelector('#section_wrap select[name="p_month"]').value = current_month + 1;

}

// 현재 (<tr> UI)
function addCalenderTr() {
    console.log('addCalenderTr() CALLED!!');

    let thisCalenderStart = new Date(current_year, current_month, 1);
    let thisCalenderStartDate = thisCalenderStart.getDate();            // 현재 월의 첫 날
    let thisCalenderStartDay = thisCalenderStart.getDay();              // 현재 월의 첫 요일 2

    let thisCalenderEnd = new Date(current_year, current_month + 1, 0);
    let thisCalenderEndDate = thisCalenderEnd.getDate();                // 현재 월의 마지막 날

    // 달력 구성 날짜 데이터
    let dates = Array();
    let dateCnt = 1;
    for(let i = 0; i < 42; i++) {
        if (i < thisCalenderStartDay || dateCnt > thisCalenderEndDate) {
            dates[i] = 0;
        } else {
            dates[i] = dateCnt;
            dateCnt++;
        }

    }

    // UI 제작 with dates
    let tableBody = document.querySelector('#table_calender tbody');

    let dateIndex = 0;
    for (let i = 0; i < 6; i++) {

        if (i >= 5 && dates[dateIndex] === 0)
            break;

        let tr = document.createElement('tr');

        for (let j = 0; j < 7; j++) {
            let td = document.createElement('td');

            // 날짜 UI
            if (dates[dateIndex] !== 0) {
                // 날짜  UI
                let dateDiv = document.createElement('div');
                dateDiv.className = 'date';
                dateDiv.textContent = dates[dateIndex];
                td.appendChild(dateDiv);

                // 일정 등록 버튼 UI
                let writeDiv = document.createElement('div');
                let writeLink = document.createElement('a');
                writeLink.className = 'write';
                writeLink.href = "#none";
                writeLink.textContent = 'write';
                writeDiv.appendChild(writeLink);
                td.appendChild(writeDiv);
            }

            tr.appendChild(td);
            dateIndex++;

        }

        tableBody.appendChild(tr);

    }

}

// 이벤트 등록
function initEvents() {
    console.log('initEvents()');

    // click 이벤트 들 처리
    document.addEventListener('click', function (event) {

        // 이전달 에서 이벤트 발생 시
        if (event.target.matches('#section_wrap .btn_pre')) {
            console.log('btn_pre CLICKED!!');
            setPreMonth();
        }

        // 다음달 에서 이벤트 발생 시
        if (event.target.matches('#section_wrap .btn_next')) {
            console.log('btn_next CLICKED!!');
            setNextMonth();
        }

        // 달력에서 일정 등록 버튼(write)을 클릭 시
        if (event.target.matches('#section_wrap a.write')) {
            console.log('write CLICKED!!');

            let year = current_year;
            let month = current_month + 1;

            let dateElement = event.target.closest("div").parentElement.querySelector('div.date');
            let date = dateElement ? dateElement.textContent.trim() : '';

            showWritePlanView(year, month, date);

        }

        // 일정 등록 모달 닫기
        if (event.target.matches('#write_plan input[value="CANCEL"]')) {
            console.log('CANCEL BUTTON CLICKED!!');

            hideWritePlanView();

        }

        // 일정 등록 확인(WRITE) 버튼 클릭 시
        if (event.target.matches('#write_plan input[value="WRITE"]')) {
            console.log('WRITE BUTTON CLICKED!!');

            let year = document.querySelector('#write_plan select[name="wp_year"]').value;      // 2026
            let month = document.querySelector('#write_plan select[name="wp_month"]').value;    // 9
            let date = document.querySelector('#write_plan select[name="wp_date"]').value;      // 10

            let title = document.querySelector('#write_plan input[name="p_title"]').value;      // 제목
            let body = document.querySelector('#write_plan input[name="p_body"]').value;        // 내용
            let file = document.querySelector('#write_plan input[name="p_file"]').value;        // 파일

            if (title === '') {
                alert('INPUT NEW PLAN TITLE!!');
                document.querySelector('#write_plan input[name="p_title"]').focus();

            } else if (body === '') {
                alert('INPUT NEW PLAN BODY!!');
                document.querySelector('#write_plan input[name="p_body"]').focus();

            } else if (file === '') {
                alert('SELECT FILE!!');
                document.querySelector('#write_plan input[name="p_file"]').focus();

            } else {
                let inputFile = document.querySelector('#write_plan input[name="p_file"]');
                console.log('inputFile: ', inputFile);

                let files = inputFile.files;
                console.log('files: ', files);

                // 비동기 방식으로 서버에 전송
                fetchWritePlan(year, month, date, title, body, files[0]);

            }

        }

    });

    // change 이벤트 들 처리
    document.addEventListener('change', function (event) {

        // 달력에서 년 변경 시
        if (event.target.matches('#section_wrap select[name="p_year"]')) {
            setMonthBySelectChanged();
        }

        // 달력에서 월 변경 시
        if (event.target.matches('#section_wrap select[name="p_month"]')) {
            setMonthBySelectChanged();
        }

        // 일정 등록 모달에서 년 변경 시
        if (event.target.matches('#write_plan select[name="wp_year"]')) {
            console.log('wp_year CHANGED!!');

            let year = event.target.value;
            let month = document.querySelector('#write_plan select[name="wp_month"]').value;

            setSelectDateOptions(year, month, 'wp_date');

        }

        // 일정 등록 모달에서 월 변경 시
        if (event.target.matches('#write_plan select[name="wp_month"]')) {
            console.log('wp_month CHANGED!!');

            let year = document.querySelector('#write_plan select[name="wp_year"]').value;
            let month = event.target.value

            setSelectDateOptions(year, month, 'wp_date');

        }

    });
}

function setPreMonth() {
    console.log('setPreMonth()');

    let yearSelect = document.querySelector('select[name="p_year"]');
    let monthSelect = document.querySelector('select[name="p_month"]');

    if (yearSelect.value == 2025 && monthSelect.value == 1) {
        alert('2025년 1월 이전은 설정할 수 없습니다.');
        return false;
    }

    let temp_year = current_year;
    let temp_month = current_month - 1;

    if (temp_month <= -1) {
        temp_year -= 1;
        temp_month = 11;
    }

    let preCalender = new Date(temp_year, temp_month, 1);

    // 현재 데이터 설정
    setCurrentCalender(
        preCalender.getFullYear(),
        preCalender.getMonth(),
        preCalender.getDate(),
        preCalender.getDay()
    )

    // UI(<select>) 렌더링
    setCurrentYearAndMonthSelectUI();

    //  UI(<tr>) 제거
    removeCalenderTr();

    // UI(<tr>) 렌더링
    addCalenderTr();

}

function setNextMonth() {
    console.log('setNextMonth()');

    let yearSelect = document.querySelector('select[name="p_year"]');
    let monthSelect = document.querySelector('select[name="p_month"]');

    if (yearSelect.value == 2030 && monthSelect.value == 12) {
        alert('2030년 12월 이후는 설정할 수 없습니다.');
        return false;
    }

    let temp_year = current_year;
    let temp_month = current_month + 1;

    if (temp_month >= 12) {
        temp_year += 1;
        temp_month = 0;
    }

    let nextCalender = new Date(temp_year, temp_month, 1);

    // 현재 데이터 설정
    setCurrentCalender(
        nextCalender.getFullYear(),
        nextCalender.getMonth(),
        nextCalender.getDate(),
        nextCalender.getDay()
    )

    // UI(<select>) 렌더링
    setCurrentYearAndMonthSelectUI();

    //  UI(<tr>) 제거
    removeCalenderTr();

    // UI(<tr>) 렌더링
    addCalenderTr();

}

function removeCalenderTr() {
    console.log('removeCalenderTr() CALLED!!');

    let tbody = document.querySelector('#table_calender tbody');
    tbody.innerHTML = '';

}

function setMonthBySelectChanged() {
    console.log('setMonthBySelectChanged() CALLED!!');

    let temp_year = document.querySelector('select[name="p_year"]').value;
    let temp_month = document.querySelector('select[name="p_month"]').value - 1;

    let seletedCalender = new Date(temp_year, temp_month, 1);

    // 데이터 설정
    setCurrentCalender(
        seletedCalender.getFullYear(),
        seletedCalender.getMonth(),
        seletedCalender.getDate(),
        seletedCalender.getDay()
    );

    // 달력 UI 렌더링
    removeCalenderTr();
    addCalenderTr();

}

function showWritePlanView(year, month, date) {
    console.log('showWritePlanView() CALLED!!');

    document.querySelector('#write_plan select[name="wp_year"]').value = year;
    document.querySelector('#write_plan select[name="wp_month"]').value = month;

    setSelectDateOptions(year, month, 'wp_date');
    document.querySelector('#write_plan select[name="wp_date"]').value = date;

    document.querySelector('#write_plan').style.display = 'block';

}

function hideWritePlanView() {
    console.log('hideWritePlanView() CALLED!!');

    document.querySelector('#write_plan input[name="p_title"]').value = '';
    document.querySelector('#write_plan input[name="p_body"]').value = '';
    document.querySelector('#write_plan input[name="p_file"]').value = '';

    document.querySelector('#write_plan').style.display = 'none';

}

function setSelectDateOptions(year, month, select_name) {   // 2026 9
    console.log('setSelectDateOptions() CALLED!!');

    console.log(month);

    // SET DATA
    let last = new Date(year, month, 0);                    // 2026 8
    console.log(last.getFullYear());                        // 2026
    console.log(last.getMonth());                           // 컴퓨터 날짜(8)  -> 인간 날짜(9)
    console.log(last.getDate());                            // 30

    // REMOVE OLD OPTIONS
    let selectElement = document.querySelector(`select[name="${select_name}"]`);
    selectElement.innerHTML = '';

    // GENERATE UI(ADD NEW OPTIONS AT SELECT)
    for (let i = 1; i <= last.getDate(); i++) {
        let option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        selectElement.appendChild(option);
    }
}

async function fetchWritePlan(year, month, date, title, body, file) {
    console.log('fetchWritePlan() CALLED!!');

    let formData = new FormData();
    formData.append("year", year);
    formData.append("month", month);
    formData.append("date", date);
    formData.append("title", title);
    formData.append("body", body);
    formData.append("file", file);

    try {
        let response = await fetch('/planner/plan', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log('fetchWritePlan() COMMUNICATION SUCCESS!! ');

        let data = await response.json();
        console.log('data: ', data);

    } catch (error) {
        console.log('fetchWritePlan() COMMUNICATION ERROR!! ', error);
        alert('일정 등록에 문제가 발생 했습니다.');

    }



}